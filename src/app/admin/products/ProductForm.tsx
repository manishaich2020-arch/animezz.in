"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toaster";
import { Save, Trash2, Upload, X, ImagePlus } from "lucide-react";

interface Category { id: string; name: string; slug: string; }

interface ProductFormProps {
  categories: Category[];
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: string;
    comparePrice: string;
    categoryId: string | null;
    images: string[];
    accentColor: string;
    themeBg: string;
    minOrderQty: number;
    isActive: boolean;
    isFeatured: boolean;
    tags: string[];
    stock: number;
    inventoryId?: string;
  };
}

// Max image size: 2MB per image, max 8 images
const MAX_SIZE_MB = 2;
const MAX_IMAGES = 8;

/** Convert a File to a base64 data URL, resized to max 800px */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Images stored as array of strings (base64 data URLs or /products/... paths)
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    price: product?.price ?? "",
    comparePrice: product?.comparePrice ?? "",
    categoryId: product?.categoryId ?? "",
    accentColor: product?.accentColor ?? "#a855f7",
    themeBg: product?.themeBg ?? "",
    minOrderQty: product?.minOrderQty ?? 1,
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    tags: product?.tags?.join(", ") ?? "",
    stock: product?.stock ?? 0,
  });

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      slug: isEdit ? prev.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    }));
  };

  // ── Image upload handlers ──────────────────────────────────

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    const toProcess = fileArr.slice(0, remaining);

    for (const file of toProcess) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${MAX_SIZE_MB}MB limit`);
        continue;
      }
      try {
        setUploadingIdx(images.length);
        const base64 = await fileToBase64(file);
        setImages((prev) => [...prev, base64]);
        toast.success(`${file.name} uploaded`);
      } catch {
        toast.error(`Failed to process ${file.name}`);
      } finally {
        setUploadingIdx(null);
      }
    }
  }, [images.length]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processFiles(e.target.files);
      e.target.value = ""; // reset so same file can be re-selected
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveImage = (from: number, to: number) => {
    setImages((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  // ── Form submit ────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error("Please add at least one product image");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        images, // array of base64 strings or /products/... paths
        stock: Number(form.stock),
        minOrderQty: Number(form.minOrderQty),
        comparePrice: form.comparePrice || null,
        categoryId: form.categoryId || null,
        inventoryId: product?.inventoryId,
      };

      const url = isEdit ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save product");
        return;
      }

      toast.success(isEdit ? "Product updated!" : "Product created!");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Product deleted");
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error("Failed to delete product");
      }
    } finally {
      setDeleting(false);
    }
  };

  const inputClass = "w-full bg-[#0d0d14] border border-white/10 text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors";
  const labelClass = "block text-sm font-medium text-slate-300 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Basic Info ─────────────────────────────────────── */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#111118] space-y-4">
        <h2 className="font-semibold text-white">Basic Information</h2>

        <div>
          <label className={labelClass}>Product Name *</label>
          <input name="name" value={form.name} onChange={handleNameChange} required className={inputClass} placeholder="e.g. Goku Super Saiyan Figure" />
        </div>

        <div>
          <label className={labelClass}>Slug *</label>
          <input name="slug" value={form.slug} onChange={handleChange} required className={inputClass} placeholder="goku-super-saiyan-figure" />
          <p className="text-xs text-slate-500 mt-1">URL: /products/{form.slug || "..."}</p>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={inputClass} placeholder="Product description..." />
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <select name="categoryId" value={form.categoryId} onChange={handleChange} className={inputClass}>
            <option value="">— Select Category —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Pricing & Stock ────────────────────────────────── */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#111118] space-y-4">
        <h2 className="font-semibold text-white">Pricing & Stock</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Price (₹) *</label>
            <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required className={inputClass} placeholder="999" />
          </div>
          <div>
            <label className={labelClass}>Compare Price (₹)</label>
            <input name="comparePrice" type="number" step="0.01" min="0" value={form.comparePrice} onChange={handleChange} className={inputClass} placeholder="1299 (strikethrough)" />
          </div>
          <div>
            <label className={labelClass}>Stock Quantity</label>
            <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Min Order Qty</label>
            <input name="minOrderQty" type="number" min="1" value={form.minOrderQty} onChange={handleChange} className={inputClass} />
          </div>
        </div>
      </div>

      {/* ── Images ─────────────────────────────────────────── */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#111118] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">
            Product Images
            <span className="text-xs text-slate-500 font-normal ml-2">
              {images.length}/{MAX_IMAGES} — first image is the main photo
            </span>
          </h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= MAX_IMAGES}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => images.length < MAX_IMAGES && fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
            ${dragOver
              ? "border-[var(--accent)] bg-[var(--accent)]/10"
              : "border-white/10 hover:border-[var(--accent)]/50 hover:bg-white/5"
            }
            ${images.length >= MAX_IMAGES ? "opacity-40 cursor-not-allowed" : ""}
          `}
        >
          <ImagePlus className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-slate-400">
            {dragOver ? "Drop images here" : "Click or drag & drop images"}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            JPEG, PNG, WebP — max {MAX_SIZE_MB}MB each — auto-resized to 800px
          </p>
        </div>

        {/* Image previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((src, idx) => (
              <div
                key={idx}
                className={`relative group rounded-xl overflow-hidden bg-[#0d0d14] border-2 transition-all ${
                  idx === 0 ? "border-[var(--accent)]" : "border-white/10"
                }`}
              >
                {/* Image */}
                <div className="aspect-square relative">
                  {src.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={`Product image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={src}
                      alt={`Product image ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  )}
                </div>

                {/* Overlay controls */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {/* Move left */}
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(idx, idx - 1)}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs"
                      title="Move left"
                    >
                      ←
                    </button>
                  )}
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {/* Move right */}
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(idx, idx + 1)}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs"
                      title="Move right"
                    >
                      →
                    </button>
                  )}
                </div>

                {/* Main badge */}
                {idx === 0 && (
                  <div className="absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--accent)] text-white">
                    Main
                  </div>
                )}

                {/* Index */}
                <div className="absolute bottom-1.5 right-1.5 text-[10px] text-white/60 bg-black/50 px-1.5 py-0.5 rounded-full">
                  {idx + 1}
                </div>
              </div>
            ))}

            {/* Add more slot */}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-[var(--accent)]/50 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-[var(--accent)] transition-colors"
              >
                <ImagePlus className="w-6 h-6" />
                <span className="text-[10px]">Add more</span>
              </button>
            )}
          </div>
        )}

        {/* Upload progress indicator */}
        {uploadingIdx !== null && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            Processing image...
          </div>
        )}

        <p className="text-xs text-slate-600">
          💡 Images are stored as base64 in the database. Drag the ← → arrows to reorder. The first image is shown as the main product photo.
        </p>
      </div>

      {/* ── Theme & Display ────────────────────────────────── */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#111118] space-y-4">
        <h2 className="font-semibold text-white">Theme & Display</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Accent Color</label>
            <div className="flex gap-2">
              <input type="color" name="accentColor" value={form.accentColor} onChange={handleChange} className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
              <input name="accentColor" value={form.accentColor} onChange={handleChange} className={`${inputClass} flex-1`} placeholder="#a855f7" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Theme Background</label>
            <input name="themeBg" value={form.themeBg} onChange={handleChange} className={inputClass} placeholder="#0a0a0f (optional)" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Tags (comma separated)</label>
          <input name="tags" value={form.tags} onChange={handleChange} className={inputClass} placeholder="goku, dragon ball, action figure" />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 accent-[var(--accent)]" />
            <span className="text-sm text-slate-300">Active (visible in store)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-4 h-4 accent-[var(--accent)]" />
            <span className="text-sm text-slate-300">Featured (homepage)</span>
          </label>
        </div>
      </div>

      {/* ── Actions ────────────────────────────────────────── */}
      <div className="flex gap-3">
        <Button type="submit" size="lg" loading={loading} className="flex-1">
          <Save className="w-4 h-4" />
          {isEdit ? "Save Changes" : "Create Product"}
        </Button>
        {isEdit && (
          <Button type="button" variant="danger" size="lg" onClick={handleDelete} loading={deleting}>
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        )}
        <Button type="button" variant="ghost" size="lg" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toaster";
import { Plus, Edit2, Trash2, Check, X, FolderOpen } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  parentId: string | null;
}

interface EditState {
  name: string;
  slug: string;
  imageUrl: string;
}

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [newForm, setNewForm] = useState({ name: "", slug: "", imageUrl: "" });
  const [editForm, setEditForm] = useState<EditState>({ name: "", slug: "", imageUrl: "" });

  // Auto-generate slug from name
  const toSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newForm.name.trim(),
          slug: newForm.slug.trim() || toSlug(newForm.name),
          imageUrl: newForm.imageUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories((prev) => [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)));
        setAdding(false);
        setNewForm({ name: "", slug: "", imageUrl: "" });
        toast.success("Category created!");
      } else {
        toast.error(data.error ?? "Failed to create category");
      }
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, slug: cat.slug, imageUrl: cat.imageUrl ?? "" });
  };

  const handleUpdate = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          slug: editForm.slug.trim(),
          imageUrl: editForm.imageUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? data.category : c)).sort((a, b) => a.name.localeCompare(b.name))
        );
        setEditingId(null);
        toast.success("Category updated!");
      } else {
        toast.error(data.error ?? "Failed to update");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Products in this category will become uncategorized.`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        toast.success("Category deleted");
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const inputClass = "bg-[#0d0d14] border border-white/10 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] w-full transition-colors";

  return (
    <div className="space-y-4">
      {/* Add button */}
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAdding(!adding)}>
          <Plus className="w-4 h-4" /> New Category
        </Button>
      </div>

      {/* Add form */}
      {adding && (
        <form onSubmit={handleCreate} className="p-5 rounded-xl border border-[var(--accent)]/30 bg-[#111118] space-y-3">
          <h3 className="font-semibold text-white text-sm">New Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Name *</label>
              <input
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value, slug: toSlug(e.target.value) })}
                required
                className={inputClass}
                placeholder="e.g. Action Figures"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Slug *</label>
              <input
                value={newForm.slug}
                onChange={(e) => setNewForm({ ...newForm, slug: e.target.value })}
                required
                className={inputClass}
                placeholder="action-figures"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">URL: /category/{newForm.slug || "..."}</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Image URL (optional)</label>
              <input
                value={newForm.imageUrl}
                onChange={(e) => setNewForm({ ...newForm, imageUrl: e.target.value })}
                className={inputClass}
                placeholder="/products/goku-action-figure.jpeg"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={loading}>
              <Check className="w-3.5 h-3.5" /> Create
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)}>
              <X className="w-3.5 h-3.5" /> Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Categories list */}
      <div className="rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#111118] border-b border-white/5">
            <tr>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Category</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium hidden sm:table-cell">Slug</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Image</th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  No categories yet. Create one above.
                </td>
              </tr>
            )}
            {categories.map((cat) => (
              <tr key={cat.id} className="bg-[#0d0d14] hover:bg-[#111118] transition-colors">
                {editingId === cat.id ? (
                  /* Edit row */
                  <>
                    <td className="px-4 py-2">
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className={inputClass}
                        placeholder="Category name"
                      />
                    </td>
                    <td className="px-4 py-2 hidden sm:table-cell">
                      <input
                        value={editForm.slug}
                        onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                        className={inputClass}
                        placeholder="category-slug"
                      />
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell">
                      <input
                        value={editForm.imageUrl}
                        onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                        className={inputClass}
                        placeholder="/products/image.jpeg"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleUpdate(cat.id)}
                          disabled={loading}
                          className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" /> Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  /* View row */
                  <>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {cat.imageUrl ? (
                          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#1a1a2e]">
                            <Image src={cat.imageUrl} alt={cat.name} width={36} height={36} className="object-cover w-full h-full" />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-[#1a1a2e] flex items-center justify-center flex-shrink-0">
                            <FolderOpen className="w-4 h-4 text-slate-500" />
                          </div>
                        )}
                        <span className="font-medium text-white">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <a
                        href={`/category/${cat.slug}`}
                        target="_blank"
                        className="text-xs text-[var(--accent)] hover:brightness-110 font-mono"
                      >
                        {cat.slug}
                      </a>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">
                        {cat.imageUrl ?? "No image"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 justify-end">
                        <button
                          onClick={() => startEdit(cat)}
                          className="flex items-center gap-1 text-xs text-[var(--accent)] hover:brightness-110"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

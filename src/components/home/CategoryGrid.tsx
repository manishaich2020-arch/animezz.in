import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";

export async function CategoryGrid() {
  let cats: Awaited<ReturnType<typeof db.query.categories.findMany>> = [];

  try {
    cats = await db.query.categories.findMany({
      where: isNull(categories.parentId),
      limit: 6,
    });
  } catch (error) {
    console.error("[home:categories] failed to load categories", error);
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {cats.map((cat) => (
        <Link
          key={cat.id}
          href={`/category/${cat.slug}`}
          className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-white/5 bg-[#111118] hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5 transition-all duration-200"
        >
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#1a1a2e] flex items-center justify-center">
            {cat.imageUrl ? (
              <Image
                src={cat.imageUrl}
                alt={cat.name}
                width={56}
                height={56}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <span className="text-2xl">🎌</span>
            )}
          </div>
          <span className="text-xs text-slate-400 group-hover:text-[var(--accent)] text-center leading-tight transition-colors">
            {cat.name}
          </span>
        </Link>
      ))}
    </div>
  );
}

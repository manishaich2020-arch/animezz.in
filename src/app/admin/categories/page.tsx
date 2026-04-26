import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";
import { CategoryManager } from "./CategoryManager";

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") redirect("/");

  const allCategories = await db.query.categories.findMany({
    where: isNull(categories.parentId),
    orderBy: (c, { asc }) => [asc(c.name)],
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">
        <span className="neon-text">Categories</span>
      </h1>
      <CategoryManager initialCategories={allCategories} />
    </div>
  );
}

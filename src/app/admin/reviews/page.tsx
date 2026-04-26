import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { reviews, products, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";

export default async function AdminReviewsPage() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "admin") redirect("/");

  const allReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      isVerified: reviews.isVerified,
      isApproved: reviews.isApproved,
      helpful: reviews.helpful,
      createdAt: reviews.createdAt,
      productName: products.name,
      productSlug: products.slug,
      userName: users.name,
      userEmail: users.email,
    })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id))
    .leftJoin(users, eq(reviews.userId, users.id))
    .orderBy(desc(reviews.createdAt))
    .limit(100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">
        <span className="neon-text">Reviews</span>
      </h1>

      {allReviews.length === 0 ? (
        <p className="text-slate-400">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {allReviews.map((r) => (
            <div key={r.id} className="p-5 rounded-xl border border-white/5 bg-[#111118]">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white text-sm">{r.userName ?? "Anonymous"}</span>
                    <span className="text-slate-500 text-xs">{r.userEmail}</span>
                    {r.isVerified && <Badge variant="success" className="text-[10px]">Verified</Badge>}
                    <Badge variant={r.isApproved ? "success" : "warning"}>{r.isApproved ? "Approved" : "Pending"}</Badge>
                  </div>
                  <a href={`/products/${r.productSlug}`} target="_blank" className="text-xs text-[var(--accent)] hover:brightness-110 mt-0.5 block">
                    {r.productName}
                  </a>
                </div>
                <div className="text-right flex-shrink-0">
                  <StarRating rating={r.rating} size="sm" />
                  <p className="text-xs text-slate-500 mt-1">{new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
              </div>
              {r.title && <p className="font-medium text-slate-200 text-sm">{r.title}</p>}
              {r.body && <p className="text-sm text-slate-400 mt-1 leading-relaxed">{r.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

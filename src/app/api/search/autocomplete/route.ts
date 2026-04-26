import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Combined full-text + trigram search
    const results = await db.execute(sql`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.price,
        p.images,
        p.accent_color,
        c.name AS category_name,
        GREATEST(
          COALESCE(ts_rank(p.search_vector, plainto_tsquery('english', ${q})), 0),
          COALESCE(similarity(p.name, ${q}), 0)
        ) AS relevance
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE
        p.is_active = true
        AND (
          p.search_vector @@ plainto_tsquery('english', ${q})
          OR word_similarity(${q}, p.name) > 0.3
          OR p.name ILIKE ${'%' + q + '%'}
        )
      ORDER BY relevance DESC, p.total_sold DESC
      LIMIT 6
    `);

    const formatted = results.rows.map((r: Record<string, unknown>) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      price: r.price,
      images: Array.isArray(r.images) ? r.images : [],
      categoryName: r.category_name,
      accentColor: r.accent_color,
    }));

    return NextResponse.json({ results: formatted });
  } catch (error) {
    console.error("Search autocomplete error:", error);
    return NextResponse.json({ results: [] });
  }
}

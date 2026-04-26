import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim() ?? "";
  const category = searchParams.get("category") ?? "";
  const minPrice = parseFloat(searchParams.get("minPrice") ?? "0");
  const maxPrice = parseFloat(searchParams.get("maxPrice") ?? "999999");
  const sort = searchParams.get("sort") ?? "relevance";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;
  const offset = (page - 1) * limit;

  // Shared WHERE condition (used in both SELECT and COUNT)
  const whereCondition = sql`
    p.is_active = true
    AND p.price BETWEEN ${minPrice} AND ${maxPrice}
    AND (${category} = '' OR c.slug = ${category})
    AND (
      ${q} = ''
      OR p.search_vector @@ plainto_tsquery('english', ${q})
      OR word_similarity(${q}, p.name) > 0.3
      OR p.name ILIKE ${'%' + q + '%'}
    )
  `;

  try {
    const orderClause = {
      relevance: sql`relevance DESC, p.total_sold DESC`,
      newest: sql`p.created_at DESC`,
      price_asc: sql`p.price ASC`,
      price_desc: sql`p.price DESC`,
      bestseller: sql`p.total_sold DESC`,
    }[sort] ?? sql`relevance DESC`;

    const results = await db.execute(sql`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.price,
        p.compare_price,
        p.images,
        p.accent_color,
        p.is_featured,
        p.total_sold,
        c.name AS category_name,
        c.slug AS category_slug,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(DISTINCT r.id) AS review_count,
        COALESCE(SUM(inv.stock - inv.reserved), 0) AS available_stock,
        GREATEST(
          CASE WHEN ${q} = '' THEN 1
               ELSE COALESCE(ts_rank(p.search_vector, plainto_tsquery('english', ${q || 'anime'})), 0)
          END,
          CASE WHEN ${q} = '' THEN 0
               ELSE COALESCE(word_similarity(${q}, p.name), 0)
          END
        ) AS relevance
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON r.product_id = p.id AND r.is_approved = true
      LEFT JOIN inventory inv ON inv.product_id = p.id
      WHERE ${whereCondition}
      GROUP BY p.id, c.name, c.slug
      ORDER BY ${orderClause}
      LIMIT ${limit} OFFSET ${offset}
    `);

    // Count total
    const countResult = await db.execute(sql`
      SELECT COUNT(DISTINCT p.id) AS total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereCondition}
    `);

    const total = parseInt((countResult.rows[0] as { total: string }).total ?? "0");

    return NextResponse.json({
      results: results.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      query: q,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ results: [], total: 0, page: 1, totalPages: 0, query: q });
  }
}

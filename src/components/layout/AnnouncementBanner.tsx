import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function AnnouncementBanner() {
  try {
    const setting = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, "announcement_banner"),
    });

    if (!setting?.value) return null;

    const message = setting.value as string;

    return (
      <div className="bg-[var(--accent)] text-white text-center text-sm py-2 px-4 font-medium">
        {message}
      </div>
    );
  } catch {
    return null;
  }
}

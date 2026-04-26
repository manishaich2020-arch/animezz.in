import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  count?: number;
}

export function StarRating({ rating, max = 5, size = "md", showCount, count }: StarRatingProps) {
  const sizes = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizes[size],
            i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-slate-600"
          )}
        />
      ))}
      {showCount && count !== undefined && (
        <span className="text-xs text-slate-400 ml-1">({count})</span>
      )}
    </div>
  );
}

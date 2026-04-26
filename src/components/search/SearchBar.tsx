"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { debounce } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: string;
  images: string[];
  categoryName?: string;
}

interface SearchBarProps {
  onClose?: () => void;
  autoFocus?: boolean;
  className?: string;
}

const RECENT_KEY = "otakuvault_recent_searches";

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const recent = getRecentSearches().filter((s) => s !== query);
  localStorage.setItem(RECENT_KEY, JSON.stringify([query, ...recent].slice(0, 5)));
}

export function SearchBar({ onClose, autoFocus, className }: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const fetchResults = debounce(async (q: string) => {
    if (!q.trim() || q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setShowDropdown(true);
    fetchResults(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveRecentSearch(query.trim());
    setRecentSearches(getRecentSearches());
    setShowDropdown(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    onClose?.();
  };

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(result.name);
    setShowDropdown(false);
    onClose?.();
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
    onClose?.();
  };

  return (
    <div className={`relative ${className ?? ""}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="Search anime, figures, mouse pads..."
          className="search-input has-icon-left has-icon-right"
          aria-label="Search products"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setResults([]); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#111118] border border-white/15 rounded-xl shadow-2xl shadow-black/70 overflow-hidden z-50 max-h-96 overflow-y-auto">
          {/* Loading */}
          {loading && (
            <div className="px-4 py-3 text-sm text-slate-400">Searching...</div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs text-slate-500 uppercase tracking-wider border-b border-white/5">
                Products
              </p>
              {results.map((r) => (
                <Link
                  key={r.id}
                  href={`/products/${r.slug}`}
                  onClick={() => handleResultClick(r)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a2e] transition-colors"
                >
                  {r.images[0] && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#111]">
                      <Image
                        src={r.images[0]}
                        alt={r.name}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{r.name}</p>
                    {r.categoryName && (
                      <p className="text-xs text-slate-400">{r.categoryName}</p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-[var(--accent)]">
                    ₹{parseFloat(r.price).toLocaleString("en-IN")}
                  </span>
                </Link>
              ))}
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => { saveRecentSearch(query); setShowDropdown(false); onClose?.(); }}
                className="block px-4 py-3 text-sm text-[var(--accent)] hover:bg-[#1a1a2e] border-t border-white/10 text-center font-medium"
              >
                See all results for &quot;{query}&quot;
              </Link>
            </div>
          )}

          {/* No results */}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-slate-400">No results for &quot;{query}&quot;</p>
              <p className="text-xs text-slate-500 mt-1">Try a different search term</p>
            </div>
          )}

          {/* Recent searches */}
          {!query && recentSearches.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs text-slate-500 uppercase tracking-wider border-b border-white/5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Recent
              </p>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleRecentClick(term)}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-[#1a1a2e] hover:text-[var(--accent)] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!query && recentSearches.length === 0 && (
            <div className="px-4 py-4 text-sm text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Start typing to search products
            </div>
          )}
        </div>
      )}
    </div>
  );
}

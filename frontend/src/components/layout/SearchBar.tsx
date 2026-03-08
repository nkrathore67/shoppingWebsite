"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

interface Suggestion {
  id: string;
  name: string;
  slug: string;
  images?: string[];
}

interface SearchBarProps {
  onClose?: () => void;
}

export function SearchBar({ onClose }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get("/search/suggestions", {
          params: { q: query },
        });
        setSuggestions(data.products || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose?.();
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for clothes, brands, categories..."
            className="pl-9 pr-4"
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>
        <Button type="submit">Search</Button>
        {onClose && (
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          {suggestions.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              onClick={onClose}
            >
              {product.images?.[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  width={40}
                  height={40}
                  className="rounded-md object-cover w-10 h-10"
                />
              )}
              <span className="text-sm text-gray-700">{product.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

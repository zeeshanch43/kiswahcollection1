import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api";
import { PRODUCTS } from "@/lib/products";

/**
 * Product catalog from the FastAPI/Supabase backend.
 * Falls back to the static catalog in `@/lib/products` when the API is
 * unreachable, so the storefront still renders offline.
 */
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: ({ signal }) => fetchProducts(signal),
    staleTime: 60_000,
    retry: 1,
    placeholderData: PRODUCTS,
  });
}

import { type Family, type Product } from "@/lib/products";

export const API_BASE = import.meta.env["VITE_API_URL"] ?? "http://127.0.0.1:8000";

export type ApiProduct = {
  id: number;
  name: string;
  category: string;
  price_pkr: number;
  volume?: string | null;
  top_notes?: string | null;
  heart_notes?: string | null;
  base_notes?: string | null;
  image_url?: string | null;
  stock?: number;
  description?: string | null;
  longevity?: number | null;
  created_at?: string | null;
};

export type ProductPatch = Partial<ProductInput> & { image_url?: string | null };

// Full payload for POST /api/products — mirrors ProductCreate in backend/schemas.py.
export type ProductInput = {
  name: string;
  category: string;
  price_pkr: number;
  volume: string;
  stock: number;
  description: string;
  top_notes: string;
  heart_notes: string;
  base_notes: string;
  longevity: number;
  image_url?: string | null;
};

// ---------------------------------------------------------------------------
// Admin auth — /admin logs in with username/password and receives a session
// token, which is sent as X-Admin-Token on every protected request. The
// backend validates the token on each call (see require_admin in
// backend/main.py); localStorage only remembers the session for convenience.
// ---------------------------------------------------------------------------
const ADMIN_TOKEN_KEY = "kiswah_admin_session";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function adminLogin(username: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (res.status === 401) throw new Error("Invalid username or password.");
  if (!res.ok) throw new Error(`Login failed (${res.status})`);
  const data = (await res.json()) as { token: string };
  return data.token;
}

export async function adminLogout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/admin/logout`, {
      method: "POST",
      headers: adminAuthHeader(),
    });
  } catch {
    // Backend unreachable — the local session is cleared by the caller anyway.
  }
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/admin/verify`, {
    headers: { "X-Admin-Token": token },
  });
  if (res.status === 401 || res.status === 503) return false;
  if (!res.ok) throw new Error(`Session check failed (${res.status})`);
  return true;
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...adminAuthHeader() },
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
  if (!res.ok) {
    const detail = (await res.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(detail?.detail ?? `Password change failed (${res.status})`);
  }
}

// Categories come from the DB; they normally match FAMILIES but keep unknown
// values intact so "All" still shows every product.
const knownFamily = (category: string): Family => (category || "Oud") as Family;

export function toProduct(p: ApiProduct): Product {
  return {
    id: String(p.id),
    name: p.name,
    family: knownFamily(p.category),
    volume: p.volume ?? "100ml",
    price: p.price_pkr,
    images: [p.image_url || null, null, null],
    notes: {
      top: p.top_notes ?? "",
      heart: p.heart_notes ?? "",
      base: p.base_notes ?? "",
    },
    description: p.description ?? "",
    longevity: p.longevity ?? 4,
  };
}

export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/api/products`, { signal: signal ?? null });
  if (!res.ok) throw new Error(`Products request failed (${res.status})`);
  const data = (await res.json()) as ApiProduct[];
  return data.map(toProduct);
}

export async function fetchApiProducts(signal?: AbortSignal): Promise<ApiProduct[]> {
  const res = await fetch(`${API_BASE}/api/products`, { signal: signal ?? null });
  if (!res.ok) throw new Error(`Products request failed (${res.status})`);
  return (await res.json()) as ApiProduct[];
}

export async function patchProduct(
  id: string | number,
  updates: ProductPatch,
): Promise<ApiProduct> {
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...adminAuthHeader() },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(await apiError("Update failed", res));
  return (await res.json()) as ApiProduct;
}

export async function createProduct(input: ProductInput): Promise<ApiProduct> {
  const res = await fetch(`${API_BASE}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...adminAuthHeader() },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await apiError("Create failed", res));
  return (await res.json()) as ApiProduct;
}

export async function deleteProduct(id: string | number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    method: "DELETE",
    headers: adminAuthHeader(),
  });
  if (!res.ok) throw new Error(await apiError("Delete failed", res));
}

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/upload-image`, {
    method: "POST",
    body: form,
    headers: adminAuthHeader(),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Upload failed (${res.status}) ${detail}`);
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

function adminAuthHeader(): Record<string, string> {
  const token = getAdminToken();
  return token ? { "X-Admin-Token": token } : {};
}

// Prefer the backend's {"detail": "..."} message; fall back to the raw body.
async function apiError(prefix: string, res: Response): Promise<string> {
  const raw = await res.text().catch(() => "");
  let msg = raw;
  try {
    const parsed = JSON.parse(raw) as { detail?: unknown };
    if (typeof parsed.detail === "string") msg = parsed.detail;
    else if (parsed.detail) msg = JSON.stringify(parsed.detail);
  } catch {
    // Not JSON — keep the raw text.
  }
  return `${prefix} (${res.status})${msg ? ` ${msg}` : ""}`;
}

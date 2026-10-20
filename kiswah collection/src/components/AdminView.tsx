import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  API_BASE,
  adminLogin,
  adminLogout,
  changeAdminPassword,
  clearAdminToken,
  createProduct,
  deleteProduct,
  fetchApiProducts,
  getAdminToken,
  patchProduct,
  setAdminToken,
  uploadImage,
  verifyAdminToken,
  type ApiProduct,
  type ProductInput,
} from "@/lib/api";

type RowStatus = "idle" | "uploading" | "saving" | "clearing" | "deleting";

function Img({ src, alt }: { src?: string | null | undefined; alt: string }) {
  return src ? (
    <img src={src} alt={alt} loading="lazy" className="h-24 w-20 shrink-0 border object-cover" />
  ) : (
    <div className="img-slot h-24 w-20 shrink-0">Image</div>
  );
}

const inputClass =
  "w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring";
const labelClass = "block text-xs uppercase tracking-wider text-muted-foreground";
const primaryBtn =
  "w-full border border-border py-2 text-xs tracking-wider uppercase transition-colors hover:bg-foreground hover:text-background disabled:opacity-50";
const ghostBtn =
  "border border-border px-3 py-2 text-xs uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background disabled:opacity-50";

export function AdminView() {
  const [authed, setAuthed] = useState(false);

  // On page load, check whether the saved session is still valid server-side;
  // backend restarts invalidate sessions, so this can flip back to login.
  useEffect(() => {
    const saved = getAdminToken();
    if (!saved) return;
    void verifyAdminToken(saved).then(setAuthed);
  }, []);

  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;

  return <AdminPanel onLogout={() => setAuthed(false)} />;
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(null);
    try {
      setAdminToken(await adminLogin(username.trim(), password));
      onSuccess();
    } catch (err) {
      setError(
        `${err instanceof Error ? err.message : String(err)} — is the backend running at ${API_BASE}?`,
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm border border-border p-8">
        <h1 className="text-2xl">Admin Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to manage products and images.</p>
        <label className={`mt-6 ${labelClass}`}>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            autoFocus
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className={`mt-4 ${labelClass}`}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className={`mt-1 ${inputClass}`}
          />
        </label>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={checking || !username.trim() || !password}
          className={`mt-6 ${primaryBtn}`}
        >
          {checking ? "Signing in…" : "Sign in"}
        </button>
        <Link
          to="/"
          className="mt-4 block text-center text-xs text-muted-foreground hover:underline"
        >
          Back to store
        </Link>
      </form>
    </div>
  );
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const queryClient = useQueryClient();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<number, RowStatus>>({});

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ApiProduct | null>(null);
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  // If the session expired (backend restarted / logged out elsewhere), drop
  // the saved token and bounce back to the login screen instead of erroring.
  const sessionExpired = useCallback(
    (e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("401")) {
        clearAdminToken();
        onLogout();
        return true;
      }
      return false;
    },
    [onLogout],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await fetchApiProducts());
    } catch (e) {
      setError(
        `Could not reach the API at ${API_BASE} — is the backend running? (${
          e instanceof Error ? e.message : String(e)
        })`,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refreshStorefront = () => {
    void queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const openCreate = () => {
    setEditing(null);
    setFormError(null);
    setShowForm(true);
    setNotice(null);
  };

  const openEdit = (product: ApiProduct) => {
    setEditing(product);
    setFormError(null);
    setShowForm(true);
    setNotice(null);
  };

  const handleFormSubmit = async (values: ProductInput, file: File | null) => {
    setFormBusy(true);
    setFormError(null);
    try {
      const image_url = file ? await uploadImage(file) : (editing?.image_url ?? null);
      if (editing) {
        const updated = await patchProduct(editing.id, { ...values, image_url });
        setProducts((rows) => rows.map((r) => (r.id === updated.id ? updated : r)));
        setNotice(`Updated ${updated.name}`);
      } else {
        const created = await createProduct({ ...values, image_url });
        setProducts((rows) => [...rows, created]);
        setNotice(`Added ${created.name}`);
      }
      refreshStorefront();
      setShowForm(false);
      setEditing(null);
    } catch (e) {
      if (!sessionExpired(e)) setFormError(e instanceof Error ? e.message : String(e));
    } finally {
      setFormBusy(false);
    }
  };

  const handleDelete = async (product: ApiProduct) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setNotice(null);
    setError(null);
    setStatus((s) => ({ ...s, [product.id]: "deleting" }));
    try {
      await deleteProduct(product.id);
      setProducts((rows) => rows.filter((r) => r.id !== product.id));
      setNotice(`Deleted ${product.name}`);
      refreshStorefront();
      if (editing?.id === product.id) {
        setEditing(null);
        setShowForm(false);
      }
    } catch (e) {
      if (!sessionExpired(e)) setError(e instanceof Error ? e.message : String(e));
    } finally {
      setStatus((s) => ({ ...s, [product.id]: "idle" }));
    }
  };

  const handleFile = async (product: ApiProduct, file: File) => {
    setNotice(null);
    setError(null);
    setStatus((s) => ({ ...s, [product.id]: "uploading" }));
    try {
      const url = await uploadImage(file);
      setStatus((s) => ({ ...s, [product.id]: "saving" }));
      const updated = await patchProduct(product.id, { image_url: url });
      setProducts((rows) => rows.map((r) => (r.id === product.id ? updated : r)));
      setNotice(`Image saved for ${product.name}`);
      refreshStorefront();
    } catch (e) {
      if (!sessionExpired(e)) setError(e instanceof Error ? e.message : String(e));
    } finally {
      setStatus((s) => ({ ...s, [product.id]: "idle" }));
    }
  };

  const handleClear = async (product: ApiProduct) => {
    setNotice(null);
    setError(null);
    setStatus((s) => ({ ...s, [product.id]: "clearing" }));
    try {
      const updated = await patchProduct(product.id, { image_url: null });
      setProducts((rows) => rows.map((r) => (r.id === product.id ? updated : r)));
      setNotice(`Image cleared for ${product.name}`);
      refreshStorefront();
    } catch (e) {
      if (!sessionExpired(e)) setError(e instanceof Error ? e.message : String(e));
    } finally {
      setStatus((s) => ({ ...s, [product.id]: "idle" }));
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPwError(null);
    if (newPw !== confirmPw) {
      setPwError("New passwords do not match.");
      return;
    }
    setPwBusy(true);
    try {
      await changeAdminPassword(currentPw, newPw);
      setNotice("Password updated — use the new password next time you log in.");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setShowPwForm(false);
    } catch (err) {
      if (!sessionExpired(err)) setPwError(err instanceof Error ? err.message : String(err));
    } finally {
      setPwBusy(false);
    }
  };

  const lock = () => {
    void adminLogout();
    clearAdminToken();
    onLogout();
  };

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl">Products</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Add, edit and manage items for sale — images go to Supabase Storage via {API_BASE}
            /api/upload-image
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <button onClick={openCreate} className="hover:underline">
            + Add product
          </button>
          <button onClick={() => void load()} className="hover:underline" disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
          <button
            onClick={() => {
              setPwError(null);
              setShowPwForm((v) => !v);
            }}
            className="hover:underline"
          >
            {showPwForm ? "Cancel" : "Change password"}
          </button>
          <button
            onClick={lock}
            className="text-muted-foreground hover:text-foreground hover:underline"
          >
            Lock
          </button>
          <Link to="/" className="hover:underline">
            Back to store
          </Link>
        </div>
      </div>

      {showForm && (
        <ProductForm
          key={editing?.id ?? "new"}
          initial={editing}
          categories={categories}
          busy={formBusy}
          error={formError}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
            setFormError(null);
          }}
        />
      )}

      {showPwForm && (
        <form onSubmit={handlePasswordChange} className="mt-6 max-w-md border border-border p-4">
          <h2 className="text-sm uppercase tracking-wider">Change password</h2>
          <label className="mt-4 block text-xs text-muted-foreground">
            Current password
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              autoComplete="current-password"
              className={`mt-1 ${inputClass}`}
            />
          </label>
          <label className="mt-3 block text-xs text-muted-foreground">
            New password
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              autoComplete="new-password"
              className={`mt-1 ${inputClass}`}
            />
          </label>
          <label className="mt-3 block text-xs text-muted-foreground">
            Confirm new password
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              autoComplete="new-password"
              className={`mt-1 ${inputClass}`}
            />
          </label>
          {pwError && <p className="mt-3 text-sm text-destructive">{pwError}</p>}
          <button
            type="submit"
            disabled={pwBusy || !currentPw || !newPw || !confirmPw}
            className={ghostBtn}
          >
            {pwBusy ? "Saving…" : "Save new password"}
          </button>
        </form>
      )}

      {notice && (
        <p className="mt-4 border border-border bg-background px-4 py-2 text-sm">{notice}</p>
      )}
      {error && (
        <p className="mt-4 border border-destructive px-4 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="mt-8 space-y-6">
        {loading && <p className="text-sm text-muted-foreground">Loading products…</p>}
        {!loading && products.length === 0 && !error && (
          <p className="text-sm text-muted-foreground">
            No products yet — use <span className="text-foreground">+ Add product</span> to create
            the first one.
          </p>
        )}

        {products.map((p) => {
          const rowStatus = status[p.id] ?? "idle";
          const busy = rowStatus !== "idle";
          return (
            <article key={p.id} className="flex flex-wrap gap-6 border border-border p-4">
              <Img src={p.image_url} alt={p.name} />
              <div className="min-w-48 flex-1">
                <h2 className="text-xl">{p.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {p.category} · {p.volume} · Rs. {p.price_pkr.toLocaleString("en-PK")} · stock{" "}
                  {p.stock}
                </p>
                <p className="mt-1 break-all text-xs text-muted-foreground">
                  {p.image_url ?? "No image"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs">
                <button onClick={() => openEdit(p)} disabled={busy} className={ghostBtn}>
                  Edit
                </button>
                <label
                  className={`cursor-pointer border border-border px-3 py-2 uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50 ${
                    rowStatus === "uploading" || rowStatus === "saving" ? "opacity-50" : ""
                  }`}
                >
                  {rowStatus === "uploading"
                    ? "Uploading…"
                    : rowStatus === "saving"
                      ? "Saving…"
                      : "Upload image"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    disabled={busy}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleFile(p, file);
                      e.target.value = "";
                    }}
                  />
                </label>
                {p.image_url && (
                  <button
                    onClick={() => void handleClear(p)}
                    disabled={busy}
                    className="border border-border px-3 py-2 uppercase tracking-wider text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    {rowStatus === "clearing" ? "Clearing…" : "Clear"}
                  </button>
                )}
                <button
                  onClick={() => void handleDelete(p)}
                  disabled={busy}
                  className="border border-destructive px-3 py-2 uppercase tracking-wider text-destructive hover:bg-destructive hover:text-background disabled:opacity-50"
                >
                  {rowStatus === "deleting" ? "Deleting…" : "Delete"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create / edit form — used for both "+ Add product" and a row's "Edit".
// (Parent remounts it with `key={editing?.id ?? "new"}` so state resets.)
// ---------------------------------------------------------------------------
function ProductForm({
  initial,
  categories,
  busy,
  error,
  onSubmit,
  onCancel,
}: {
  initial: ApiProduct | null;
  categories: string[];
  busy: boolean;
  error: string | null;
  onSubmit: (values: ProductInput, file: File | null) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [volume, setVolume] = useState(initial?.volume ?? "100ml");
  const [price, setPrice] = useState(initial ? String(initial.price_pkr) : "");
  const [stock, setStock] = useState(String(initial?.stock ?? 50));
  const [longevity, setLongevity] = useState(String(initial?.longevity ?? 5));
  const [topNotes, setTopNotes] = useState(initial?.top_notes ?? "");
  const [heartNotes, setHeartNotes] = useState(initial?.heart_notes ?? "");
  const [baseNotes, setBaseNotes] = useState(initial?.base_notes ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial?.image_url ?? null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(initial?.image_url ?? null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, initial?.image_url]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const priceNum = Number(price);
    if (!name.trim()) return setLocalError("Name is required.");
    if (!category.trim()) return setLocalError("Category is required.");
    if (!Number.isFinite(priceNum) || priceNum <= 0) return setLocalError("Price must be > 0.");
    if (!Number.isFinite(Number(stock)) || Number(stock) < 0)
      return setLocalError("Stock must be 0 or more.");
    const long = Math.min(5, Math.max(1, Math.round(Number(longevity) || 5)));
    setLocalError(null);
    onSubmit(
      {
        name: name.trim(),
        category: category.trim(),
        price_pkr: priceNum,
        volume: volume.trim() || "100ml",
        stock: Math.trunc(Number(stock)),
        description: description.trim(),
        top_notes: topNotes.trim(),
        heart_notes: heartNotes.trim(),
        base_notes: baseNotes.trim(),
        longevity: long,
      },
      file,
    );
  };

  return (
    <form onSubmit={submit} className="mt-6 border border-border p-4" data-testid="product-form">
      <div className="flex items-center justify-between">
        <h2 className="text-sm uppercase tracking-wider">
          {initial ? `Edit — ${initial.name}` : "Add product"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-muted-foreground hover:underline"
        >
          Cancel
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Name *
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Amber Oud"
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className={labelClass}>
          Category *
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Oud"
            list="product-categories"
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className={labelClass}>
          Volume
          <input
            type="text"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            placeholder="100ml"
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className={labelClass}>
          Price (PKR) *
          <input
            type="number"
            min="1"
            step="any"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="8500"
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className={labelClass}>
          Stock
          <input
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className={labelClass}>
          Longevity (1–5)
          <input
            type="number"
            min="1"
            max="5"
            step="1"
            value={longevity}
            onChange={(e) => setLongevity(e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className={labelClass}>
          Top notes
          <input
            type="text"
            value={topNotes}
            onChange={(e) => setTopNotes(e.target.value)}
            placeholder="Saffron"
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className={labelClass}>
          Heart notes
          <input
            type="text"
            value={heartNotes}
            onChange={(e) => setHeartNotes(e.target.value)}
            placeholder="Cambodian Oud"
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className={labelClass}>
          Base notes
          <input
            type="text"
            value={baseNotes}
            onChange={(e) => setBaseNotes(e.target.value)}
            placeholder="Amber"
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className={labelClass}>
          Image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-xs text-muted-foreground file:mr-3 file:border file:border-border file:bg-background file:px-3 file:py-2 file:text-xs file:uppercase file:tracking-wider hover:file:bg-foreground hover:file:text-background"
          />
        </label>
        <label className={`sm:col-span-2 ${labelClass}`}>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="A regal blend of smoky Cambodian oud…"
            className={`mt-1 ${inputClass}`}
          />
        </label>
      </div>

      <datalist id="product-categories">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {previewUrl && (
        <div className="mt-4 flex items-center gap-3">
          <img src={previewUrl} alt="Preview" className="h-24 w-20 border object-cover" />
          <span className="text-xs text-muted-foreground">
            {file ? "New image (uploads on save)" : "Current image"}
          </span>
        </div>
      )}

      {(localError || error) && (
        <p className="mt-3 text-sm text-destructive">{localError ?? error}</p>
      )}

      <div className="mt-4 flex gap-3">
        <button type="submit" disabled={busy} className={ghostBtn}>
          {busy ? "Saving…" : initial ? "Save changes" : "Add product"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

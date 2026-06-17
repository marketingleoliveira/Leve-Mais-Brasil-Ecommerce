import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Edit, Trash2, X, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/format";
import { scrapeProduct } from "@/lib/scrape-product.functions";

type Product = {
  id: string;
  slug: string;
  title: string;
  price: number;
  cost: number | null;
  stock: number | null;
  is_active: boolean;
  is_featured: boolean;
  category_id: string | null;
  supplier_id: string | null;
  description?: string | null;
  short_description?: string | null;
  images?: string[] | null;
  source_url?: string | null;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export const Route = createFileRoute("/_authenticated/admin/produtos")({
  component: AdminProdutos,
});

function AdminProdutos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const scrape = useServerFn(scrapeProduct);

  async function load() {
    const [{ data: p }, { data: c }, { data: s }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name").order("display_order"),
      supabase.from("suppliers").select("id, name"),
    ]);
    setProducts((p ?? []) as Product[]);
    setCategories(c ?? []);
    setSuppliers(s ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleImport() {
    if (!importUrl.trim()) return;
    setImporting(true);
    try {
      const result = await scrape({ data: { url: importUrl.trim() } });
      setEditing((prev) => ({
        ...(prev ?? { is_active: true }),
        title: result.title || prev?.title || "",
        slug: prev?.slug || slugify(result.title || ""),
        description: result.description || prev?.description || "",
        short_description: result.short_description || prev?.short_description || "",
        price: result.price ?? prev?.price,
        images: result.images.length ? result.images : prev?.images ?? [],
        source_url: result.source_url,
      }));
      setImportUrl("");
    } catch (e) {
      alert("Falha ao importar: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setImporting(false);
    }
  }

  async function save() {
    if (!editing?.title || !editing?.slug || editing.price == null) {
      alert("Preencha título, slug e preço");
      return;
    }
    const payload = {
      slug: editing.slug,
      title: editing.title,
      price: Number(editing.price),
      cost: editing.cost != null && editing.cost !== ("" as never) ? Number(editing.cost) : null,
      stock: editing.stock != null && editing.stock !== ("" as never) ? Number(editing.stock) : null,
      is_active: editing.is_active ?? true,
      is_featured: editing.is_featured ?? false,
      category_id: editing.category_id || null,
      supplier_id: editing.supplier_id || null,
      description: editing.description || null,
      short_description: editing.short_description || null,
      images: editing.images && editing.images.length ? editing.images : [],
      source_url: editing.source_url || null,
    };
    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) { alert(error.message); return; }
    setEditing(null);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Excluir este produto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) alert(error.message);
    await load();
  }

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-muted-foreground text-sm">{products.length} cadastrados</p>
        </div>
        <button onClick={() => setEditing({ is_active: true, images: [] })} className="h-10 px-5 bg-primary text-primary-foreground rounded-full font-semibold inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Novo produto
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3 hidden md:table-cell">Custo</th>
              <th className="px-4 py-3 hidden md:table-cell">Margem</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const margin = p.cost ? ((p.price - p.cost) / p.price) * 100 : null;
              return (
                <tr key={p.id} className="border-t border-border hover:bg-secondary/50">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3">{formatBRL(p.price)}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{p.cost ? formatBRL(p.cost) : "—"}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{margin != null ? `${margin.toFixed(0)}%` : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${p.is_active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                      {p.is_active ? "Ativo" : "Inativo"}
                    </span>
                    {p.is_featured && <span className="ml-1 text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground font-semibold">★</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setEditing(p)} className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-secondary" aria-label="Editar"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => remove(p.id)} className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-destructive/10 text-destructive" aria-label="Excluir"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editing.id ? "Editar produto" : "Novo produto"}</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>

            <div className="mb-4 p-3 bg-secondary/50 rounded-xl">
              <label className="text-xs font-semibold text-muted-foreground block mb-2">
                Importar de URL (Shopee, AliExpress, Mercado Livre, Amazon...)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://shopee.com.br/..."
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-lg border border-input bg-card text-sm"
                />
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing || !importUrl.trim()}
                  className="h-10 px-4 bg-primary text-primary-foreground rounded-lg font-semibold inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Importar
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Preenche título, descrição, preço e imagens automaticamente.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <F label="Título" value={editing.title ?? ""} onChange={(v) => setEditing({ ...editing, title: v, slug: editing.slug || slugify(v) })} className="sm:col-span-2" />
              <F label="Slug (URL)" value={editing.slug ?? ""} onChange={(v) => setEditing({ ...editing, slug: v })} className="sm:col-span-2" />
              <FArea label="Descrição curta" value={editing.short_description ?? ""} onChange={(v) => setEditing({ ...editing, short_description: v })} className="sm:col-span-2" rows={2} />
              <FArea label="Descrição completa" value={editing.description ?? ""} onChange={(v) => setEditing({ ...editing, description: v })} className="sm:col-span-2" rows={4} />
              <FArea
                label="Imagens (uma URL por linha)"
                value={(editing.images ?? []).join("\n")}
                onChange={(v) => setEditing({ ...editing, images: v.split("\n").map((s) => s.trim()).filter(Boolean) })}
                className="sm:col-span-2"
                rows={3}
              />
              {editing.images && editing.images.length > 0 && (
                <div className="sm:col-span-2 flex gap-2 overflow-x-auto">
                  {editing.images.map((url, i) => (
                    <img key={i} src={url} alt={`Preview ${i + 1}`} className="h-20 w-20 object-cover rounded-lg border border-border flex-shrink-0" onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0.3")} />
                  ))}
                </div>
              )}
              <F label="Preço de venda (R$)" type="number" value={String(editing.price ?? "")} onChange={(v) => setEditing({ ...editing, price: v as never })} />
              <F label="Custo do fornecedor (R$)" type="number" value={String(editing.cost ?? "")} onChange={(v) => setEditing({ ...editing, cost: v as never })} />
              <F label="Estoque (opcional)" type="number" value={String(editing.stock ?? "")} onChange={(v) => setEditing({ ...editing, stock: v as never })} />
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Categoria</span>
                <select value={editing.category_id ?? ""} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })} className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-card">
                  <option value="">—</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold text-muted-foreground">Fornecedor</span>
                <select value={editing.supplier_id ?? ""} onChange={(e) => setEditing({ ...editing, supplier_id: e.target.value })} className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-card">
                  <option value="">—</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                <span className="text-sm">Ativo</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editing.is_featured ?? false} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} />
                <span className="text-sm">Destaque</span>
              </label>
            </div>
            <div className="mt-5 flex gap-3 justify-end">
              <button onClick={() => setEditing(null)} className="h-10 px-5 border border-border rounded-full font-semibold">Cancelar</button>
              <button onClick={save} className="h-10 px-5 bg-primary text-primary-foreground rounded-full font-bold">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, value, onChange, type = "text", className = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
    </label>
  );
}

function FArea({ label, value, onChange, className = "", rows = 3 }: { label: string; value: string; onChange: (v: string) => void; className?: string; rows?: number }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring text-sm font-mono" />
    </label>
  );
}

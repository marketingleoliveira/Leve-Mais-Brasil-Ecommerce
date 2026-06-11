import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense, useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { ProductCard, type ProductCardData } from "@/components/product-card";

const searchSchema = z.object({
  cat: z.string().optional(),
  q: z.string().optional(),
  sort: z.enum(["recent", "price_asc", "price_desc", "popular"]).optional(),
});

const catalogOptions = (cat: string | undefined) =>
  queryOptions({
    queryKey: ["catalog", cat ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("id, slug, title, short_description, price, compare_at_price, rating, rating_count, images, category_id, sales_count, created_at")
        .eq("is_active", true);
      if (cat) {
        const { data: c } = await supabase.from("categories").select("id").eq("slug", cat).maybeSingle();
        if (c) query = query.eq("category_id", c.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as (ProductCardData & { sales_count: number; created_at: string })[];
    },
  });

const allCatsOptions = queryOptions({
  queryKey: ["categories", "all"],
  queryFn: async () => {
    const { data } = await supabase.from("categories").select("id, slug, name").eq("is_active", true).order("display_order");
    return data ?? [];
  },
});

export const Route = createFileRoute("/produtos")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ cat: search.cat }),
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(catalogOptions(deps.cat)),
      context.queryClient.ensureQueryData(allCatsOptions),
    ]),
  errorComponent: () => <SiteLayout><div className="p-10 text-center">Erro ao carregar produtos.</div></SiteLayout>,
  notFoundComponent: () => <SiteLayout><div className="p-10 text-center">Categoria não encontrada.</div></SiteLayout>,
  head: ({ match }) => ({
    meta: [
      { title: `Produtos${match.search.cat ? ` — ${match.search.cat}` : ""} | Leve Mais Brasil` },
      { name: "description", content: "Catálogo completo de produtos com frete para todo o Brasil." },
    ],
  }),
  component: Catalog,
});

function Catalog() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [q, setQ] = useState(search.q ?? "");

  return (
    <SiteLayout>
      <div className="bg-gradient-brasil text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-extrabold">Catálogo</h1>
          <p className="mt-2 text-primary-foreground/90">Encontre o que você procura</p>
        </div>
      </div>

      <Suspense fallback={<div className="p-10 text-center text-muted-foreground">Carregando…</div>}>
        <CatalogInner q={q} setQ={setQ} search={search} navigate={navigate} />
      </Suspense>
    </SiteLayout>
  );
}

function CatalogInner({ q, setQ, search, navigate }: {
  q: string;
  setQ: (v: string) => void;
  search: z.infer<typeof searchSchema>;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const { data: products } = useSuspenseQuery(catalogOptions(search.cat));
  const { data: cats } = useSuspenseQuery(allCatsOptions);

  const filtered = useMemo(() => {
    let list = [...products];
    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(term));
    }
    switch (search.sort) {
      case "price_asc": list.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case "price_desc": list.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case "popular": list.sort((a, b) => (b.sales_count ?? 0) - (a.sales_count ?? 0)); break;
      default: list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [products, q, search.sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-[240px_1fr] gap-8">
      <aside className="space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" /> Categorias
          </h3>
          <div className="flex flex-wrap lg:flex-col gap-2">
            <button
              onClick={() => navigate({ search: { ...search, cat: undefined } })}
              className={`text-left text-sm px-3 py-2 rounded-lg transition ${!search.cat ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-secondary"}`}
            >
              Todas
            </button>
            {cats.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate({ search: { ...search, cat: c.slug } })}
                className={`text-left text-sm px-3 py-2 rounded-lg transition ${search.cat === c.slug ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-secondary"}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar produtos…"
              className="w-full h-11 pl-10 pr-3 rounded-full border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={search.sort ?? "recent"}
            onChange={(e) => navigate({ search: { ...search, sort: e.target.value as never } })}
            className="h-11 px-4 rounded-full border border-input bg-card text-sm"
          >
            <option value="recent">Mais recentes</option>
            <option value="popular">Mais vendidos</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
          </select>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{filtered.length} produto{filtered.length !== 1 ? "s" : ""}</p>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Nenhum produto encontrado.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

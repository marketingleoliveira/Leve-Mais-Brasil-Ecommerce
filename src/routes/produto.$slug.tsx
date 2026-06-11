import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { ShoppingCart, Star, Shield, Truck, Tag, Minus, Plus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { formatBRL, discountPercent } from "@/lib/format";
import { useCart } from "@/lib/cart-store";
import { productImage } from "@/lib/product-images";

const productOptions = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

export const Route = createFileRoute("/produto/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productOptions(params.slug)),
  errorComponent: () => <SiteLayout><div className="p-10 text-center">Erro ao carregar produto.</div></SiteLayout>,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold">Produto não encontrado</h1>
        <Link to="/produtos" className="mt-4 inline-block text-primary hover:underline">Ver outros produtos</Link>
      </div>
    </SiteLayout>
  ),
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} | Leve Mais Brasil` }],
  }),
  component: PDP,
});

function PDP() {
  return (
    <SiteLayout>
      <Suspense fallback={<div className="p-10 text-center">Carregando…</div>}>
        <PDPInner />
      </Suspense>
    </SiteLayout>
  );
}

function PDPInner() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(productOptions(slug));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);

  const price = Number(p.price);
  const compare = p.compare_at_price ? Number(p.compare_at_price) : null;
  const disc = discountPercent(price, compare);
  const img = productImage(p.slug, p.images?.[0]);
  const pixPrice = price * 0.9;

  function handleAdd() {
    add({ productId: p.id, slug: p.slug, title: p.title, image: img, price }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link to="/" className="hover:text-primary">Início</Link>
        {" / "}
        <Link to="/produtos" className="hover:text-primary">Produtos</Link>
        {p.categories && (<>{" / "}<Link to="/produtos" search={{ cat: p.categories.slug } as never} className="hover:text-primary">{p.categories.name}</Link></>)}
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="bg-card rounded-3xl overflow-hidden shadow-card aspect-square relative">
          <img src={img} alt={p.title} width={800} height={800} className="w-full h-full object-cover" />
          {disc && (
            <span className="absolute top-4 left-4 badge-promo px-3 py-1.5 rounded-full text-sm">
              -{disc}% OFF
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">{p.title}</h1>
          {p.short_description && <p className="mt-2 text-muted-foreground">{p.short_description}</p>}

          {Number(p.rating) > 0 && (
            <div className="flex items-center gap-2 mt-3 text-sm">
              <div className="flex">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className={`h-4 w-4 ${i <= Math.round(Number(p.rating)) ? "fill-accent text-accent" : "text-muted"}`} />
                ))}
              </div>
              <span className="font-semibold">{Number(p.rating).toFixed(1)}</span>
              <span className="text-muted-foreground">({p.rating_count} avaliações · {p.sales_count} vendidos)</span>
            </div>
          )}

          <div className="mt-6 p-5 bg-secondary rounded-2xl">
            {compare && (
              <div className="text-sm text-muted-foreground">
                De <span className="line-through">{formatBRL(compare)}</span> por
              </div>
            )}
            <div className="text-4xl font-extrabold text-primary font-display">{formatBRL(price)}</div>
            <div className="text-sm text-muted-foreground mt-1">em até 12x de {formatBRL(price / 12)} sem juros</div>
            <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-success">
              <Tag className="h-4 w-4" /> {formatBRL(pixPrice)} no Pix (10% off)
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-border rounded-full">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-11 w-11 flex items-center justify-center hover:bg-secondary rounded-l-full" aria-label="Diminuir">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="h-11 w-11 flex items-center justify-center hover:bg-secondary rounded-r-full" aria-label="Aumentar">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="flex-1 h-12 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary-dark transition shadow-md"
            >
              {added ? (<><Check className="h-5 w-5" /> Adicionado!</>) : (<><ShoppingCart className="h-5 w-5" /> Adicionar ao carrinho</>)}
            </button>
          </div>

          <Link to="/carrinho" className="mt-3 block w-full h-12 leading-[3rem] text-center bg-accent text-accent-foreground font-bold rounded-full hover:opacity-90 transition">
            Comprar agora
          </Link>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-xl">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <div className="font-semibold">Frete Brasil</div>
                <div className="text-xs text-muted-foreground">Calcule no checkout</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-xl">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <div className="font-semibold">Garantia 7 dias</div>
                <div className="text-xs text-muted-foreground">Devolução grátis</div>
              </div>
            </div>
          </div>

          {p.description && (
            <div className="mt-8 prose prose-sm max-w-none">
              <h2 className="text-lg font-bold mb-2">Descrição</h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{p.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

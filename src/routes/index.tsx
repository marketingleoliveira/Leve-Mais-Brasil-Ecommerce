import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Truck, Shield, Zap, Heart, ArrowRight, Tag, Smartphone, Home as HomeIcon, Sparkles, Dumbbell, PawPrint, Car } from "lucide-react";
import { Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import heroImg from "@/assets/hero-brasil.jpg";

const featuredOptions = queryOptions({
  queryKey: ["products", "featured"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, title, short_description, price, compare_at_price, rating, rating_count, images")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("sales_count", { ascending: false })
      .limit(8);
    if (error) throw error;
    return (data ?? []) as ProductCardData[];
  },
});

const categoriesOptions = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, icon")
      .eq("is_active", true)
      .order("display_order");
    if (error) throw error;
    return data ?? [];
  },
});

const iconMap: Record<string, typeof Smartphone> = {
  Smartphone, Home: HomeIcon, Sparkles, Dumbbell, PawPrint, Car,
};

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(featuredOptions),
      context.queryClient.ensureQueryData(categoriesOptions),
    ]),
  errorComponent: () => <SiteLayout><div className="p-10 text-center">Erro ao carregar. Recarregue a página.</div></SiteLayout>,
  notFoundComponent: () => <SiteLayout><div className="p-10 text-center">Página não encontrada.</div></SiteLayout>,
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      <Hero />
      <Benefits />
      <Suspense fallback={null}><Categories /></Suspense>
      <Suspense fallback={null}><Featured /></Suspense>
      <PromoBanner />
      <About />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
      <div className="absolute inset-0 opacity-30">
        <img src={heroImg} alt="" width={1600} height={1024} className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32 grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider">
            <Tag className="h-3.5 w-3.5" /> Mega ofertas Brasil
          </span>
          <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-balance">
            Mais produtos.<br />
            <span className="text-accent">Mais economia.</span><br />
            Mais para você.
          </h1>
          <p className="mt-5 text-lg text-primary-foreground/90 max-w-lg">
            A loja brasileira de tudo que você precisa — com frete para todo o Brasil e Pix com até 10% off.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/produtos" className="inline-flex items-center gap-2 h-12 px-7 bg-accent text-accent-foreground font-bold rounded-full hover:opacity-90 transition shadow-lg">
              Ver ofertas <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/produtos" className="inline-flex items-center gap-2 h-12 px-7 bg-primary-foreground/10 backdrop-blur border border-primary-foreground/30 text-primary-foreground font-semibold rounded-full hover:bg-primary-foreground/20 transition">
              Explorar catálogo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    { icon: Truck, title: "Frete pra todo Brasil", desc: "Acompanhe seu pedido" },
    { icon: Shield, title: "Compra 100% segura", desc: "Pagamento criptografado" },
    { icon: Zap, title: "Pix com desconto", desc: "Até 10% off à vista" },
    { icon: Heart, title: "Atendimento BR", desc: "WhatsApp e e-mail" },
  ];
  return (
    <section className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((it) => (
          <div key={it.title} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <it.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">{it.title}</div>
              <div className="text-xs text-muted-foreground">{it.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Categories() {
  const { data } = useSuspenseQuery(categoriesOptions);
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Categorias</h2>
          <p className="text-muted-foreground mt-1">Escolha por onde começar</p>
        </div>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
        {data.map((c) => {
          const Icon = iconMap[c.icon ?? ""] ?? Tag;
          return (
            <Link
              key={c.id}
              to="/produtos"
              search={{ cat: c.slug } as never}
              className="group flex flex-col items-center justify-center gap-3 p-4 md:p-6 bg-card border border-border rounded-2xl hover:border-primary hover:shadow-card transition-all hover:-translate-y-0.5"
            >
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-gradient-brasil flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform">
                <Icon className="h-6 w-6 md:h-7 md:w-7" />
              </div>
              <span className="text-xs md:text-sm font-semibold text-center">{c.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Featured() {
  const { data } = useSuspenseQuery(featuredOptions);
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent-foreground bg-accent px-3 py-1 rounded-full">Destaques</span>
          <h2 className="text-2xl md:text-3xl font-bold mt-3">Mais vendidos do mês</h2>
        </div>
        <Link to="/produtos" className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          Ver tudo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {data.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}

function PromoBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-brasil p-8 md:p-14 text-primary-foreground">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
            Pague no Pix e ganhe <span className="text-accent">10% off</span>
          </h2>
          <p className="mt-3 text-primary-foreground/90 md:text-lg">
            Desconto aplicado direto no checkout. Parcelamento em até 12x sem juros no cartão.
          </p>
          <Link to="/produtos" className="mt-6 inline-flex items-center gap-2 h-12 px-7 bg-primary-foreground text-primary font-bold rounded-full hover:bg-accent hover:text-accent-foreground transition">
            Aproveitar agora <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
        <div className="absolute -right-8 -bottom-8 h-64 w-64 md:h-80 md:w-80 rounded-full bg-accent/30 blur-3xl" />
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="sobre" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Nossa missão</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3">Curadoria brasileira, preços de verdade</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Selecionamos produtos úteis, divertidos e tendências que cabem no bolso do brasileiro. Trabalhamos com parceiros logísticos para entregar em todo o país, com a melhor experiência de compra.
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Garantia de devolução em 7 dias</li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Suporte em português</li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Em breve também na Shopee e TikTok Shop</li>
          </ul>
        </div>
        <div className="rounded-3xl overflow-hidden shadow-card aspect-square md:aspect-auto md:h-96">
          <img src={heroImg} alt="Brasil" width={800} height={800} loading="lazy" className="w-full h-full object-cover" />
        </div>
      </div>
    </section>
  );
}

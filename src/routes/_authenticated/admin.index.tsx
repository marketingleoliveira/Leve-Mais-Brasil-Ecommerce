import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0 });

  useEffect(() => {
    (async () => {
      const [p, o, c, rev] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total").eq("payment_status", "approved"),
      ]);
      const revenue = (rev.data ?? []).reduce((a, x) => a + Number(x.total), 0);
      setStats({ products: p.count ?? 0, orders: o.count ?? 0, customers: c.count ?? 0, revenue });
    })();
  }, []);

  const cards = [
    { icon: Package, label: "Produtos", value: stats.products, color: "bg-primary/10 text-primary" },
    { icon: ShoppingBag, label: "Pedidos", value: stats.orders, color: "bg-accent/30 text-accent-foreground" },
    { icon: Users, label: "Clientes", value: stats.customers, color: "bg-brasil-blue/10 text-brasil-blue" },
    { icon: TrendingUp, label: "Receita confirmada", value: formatBRL(stats.revenue), color: "bg-success/10 text-success" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Visão geral</h1>
      <p className="text-muted-foreground">Resumo da sua loja</p>
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-2xl p-5">
            <div className={`h-10 w-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
              <c.icon className="h-5 w-5" />
            </div>
            <div className="text-xs text-muted-foreground">{c.label}</div>
            <div className="text-2xl font-extrabold mt-1">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-card border border-border rounded-2xl p-6">
        <h2 className="font-bold mb-3">Próximos passos</h2>
        <ul className="text-sm space-y-2 text-muted-foreground">
          <li>✓ Banco de dados configurado</li>
          <li>✓ Catálogo de produtos ativo</li>
          <li>✓ Sistema de pedidos pronto</li>
          <li>○ Conectar Mercado Pago (Pix/Cartão)</li>
          <li>○ Integrar Shopee e TikTok Shop</li>
        </ul>
      </div>
    </div>
  );
}

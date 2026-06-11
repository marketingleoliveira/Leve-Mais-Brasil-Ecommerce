import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/format";

const statusLabels: Record<string, { label: string; cls: string }> = {
  pending: { label: "Aguardando pagamento", cls: "bg-warning/20 text-warning" },
  paid: { label: "Pago", cls: "bg-success/20 text-success" },
  processing: { label: "Em preparação", cls: "bg-primary/20 text-primary" },
  shipped: { label: "Enviado", cls: "bg-primary/20 text-primary" },
  delivered: { label: "Entregue", cls: "bg-success/20 text-success" },
  cancelled: { label: "Cancelado", cls: "bg-destructive/20 text-destructive" },
  refunded: { label: "Reembolsado", cls: "bg-muted text-muted-foreground" },
};

export const Route = createFileRoute("/_authenticated/conta/pedidos")({
  component: Pedidos,
});

function Pedidos() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Array<{ id: string; order_number: string; status: string; total: number; created_at: string; order_items: Array<{ product_title: string; quantity: number }> }>>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, status, total, created_at, order_items(product_title, quantity)")
        .order("created_at", { ascending: false });
      setOrders((data ?? []) as never);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground" />
        <p className="mt-3 font-semibold">Você ainda não tem pedidos</p>
        <Link to="/produtos" className="mt-4 inline-block text-primary hover:underline">Ver produtos</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => {
        const st = statusLabels[o.status] ?? { label: o.status, cls: "" };
        return (
          <div key={o.id} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="font-bold">#{o.order_number}</div>
                <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("pt-BR")}</div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${st.cls}`}>{st.label}</span>
            </div>
            <div className="mt-3 text-sm text-muted-foreground line-clamp-2">
              {o.order_items.map((i) => `${i.quantity}× ${i.product_title}`).join(" · ")}
            </div>
            <div className="mt-3 text-right font-bold text-primary">{formatBRL(o.total)}</div>
          </div>
        );
      })}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/format";

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;
type Status = (typeof STATUSES)[number];

const statusBadge: Record<Status, string> = {
  pending: "bg-warning/20 text-warning",
  paid: "bg-success/20 text-success",
  processing: "bg-primary/20 text-primary",
  shipped: "bg-brasil-blue/20 text-brasil-blue",
  delivered: "bg-success/20 text-success",
  cancelled: "bg-destructive/20 text-destructive",
  refunded: "bg-muted text-muted-foreground",
};

export const Route = createFileRoute("/_authenticated/admin/pedidos")({
  component: AdminPedidos,
});

function AdminPedidos() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Array<{
    id: string; order_number: string; status: Status; total: number; created_at: string;
    payment_method: string | null; payment_status: string; tracking_code: string | null;
    profiles: { full_name: string | null } | null;
    order_items: Array<{ product_title: string; quantity: number }>;
  }>>([]);

  async function load() {
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, status, total, created_at, payment_method, payment_status, tracking_code, user_id, order_items(product_title, quantity), profiles:user_id(full_name)")
      .order("created_at", { ascending: false });
    setOrders((data ?? []) as never);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: Status) {
    await supabase.from("orders").update({ status }).eq("id", id);
    await load();
  }

  async function updateTracking(id: string, tracking_code: string) {
    await supabase.from("orders").update({ tracking_code }).eq("id", id);
    await load();
  }

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div>
      <h1 className="text-2xl font-bold">Pedidos</h1>
      <p className="text-muted-foreground text-sm mb-6">{orders.length} pedidos</p>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum pedido ainda.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="font-bold">#{o.order_number}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.profiles?.full_name ?? "Cliente"} · {new Date(o.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusBadge[o.status]}`}>{o.status}</span>
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value as Status)} className="h-9 px-2 text-sm border border-input rounded-lg bg-card">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-3 text-sm">
                {o.order_items.map((i, idx) => (
                  <div key={idx} className="text-muted-foreground">{i.quantity}× {i.product_title}</div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <input
                  placeholder="Código de rastreio"
                  defaultValue={o.tracking_code ?? ""}
                  onBlur={(e) => e.target.value !== (o.tracking_code ?? "") && updateTracking(o.id, e.target.value)}
                  className="h-9 px-3 text-sm border border-input rounded-lg bg-card flex-1 min-w-[180px]"
                />
                <span className="text-xs text-muted-foreground">{o.payment_method ?? "—"} · {o.payment_status}</span>
                <span className="font-bold text-primary">{formatBRL(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

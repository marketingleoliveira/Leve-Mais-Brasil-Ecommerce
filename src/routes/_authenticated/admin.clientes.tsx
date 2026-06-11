import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/clientes")({
  component: AdminClientes,
});

function AdminClientes() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Array<{ id: string; full_name: string | null; phone: string | null; created_at: string; spent: number; orders: number }>>([]);

  useEffect(() => {
    (async () => {
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, phone, created_at").order("created_at", { ascending: false });
      const { data: orders } = await supabase.from("orders").select("user_id, total").eq("payment_status", "approved");
      const agg: Record<string, { spent: number; orders: number }> = {};
      (orders ?? []).forEach((o) => {
        const k = o.user_id ?? "";
        if (!agg[k]) agg[k] = { spent: 0, orders: 0 };
        agg[k].spent += Number(o.total);
        agg[k].orders += 1;
      });
      setRows((profiles ?? []).map((p) => ({ ...p, spent: agg[p.id]?.spent ?? 0, orders: agg[p.id]?.orders ?? 0 })));
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div>
      <h1 className="text-2xl font-bold">Clientes</h1>
      <p className="text-muted-foreground text-sm mb-6">{rows.length} cadastrados</p>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3 hidden md:table-cell">Telefone</th>
              <th className="px-4 py-3">Pedidos</th>
              <th className="px-4 py-3">Gastou</th>
              <th className="px-4 py-3 hidden md:table-cell">Desde</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{r.full_name ?? "—"}</td>
                <td className="px-4 py-3 hidden md:table-cell">{r.phone ?? "—"}</td>
                <td className="px-4 py-3">{r.orders}</td>
                <td className="px-4 py-3 font-semibold text-primary">{formatBRL(r.spent)}</td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{new Date(r.created_at).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

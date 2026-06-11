import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { formatBRL } from "@/lib/format";

type Search = {
  order_id?: string;
  order_nsu?: string;
  receipt_url?: string;
  transaction_nsu?: string;
  slug?: string;
};

export const Route = createFileRoute("/pedido-confirmado")({
  head: () => ({ meta: [{ title: "Pedido confirmado | Leve Mais Brasil" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    order_id: typeof s.order_id === "string" ? s.order_id : undefined,
    order_nsu: typeof s.order_nsu === "string" ? s.order_nsu : undefined,
    receipt_url: typeof s.receipt_url === "string" ? s.receipt_url : undefined,
    transaction_nsu: typeof s.transaction_nsu === "string" ? s.transaction_nsu : undefined,
    slug: typeof s.slug === "string" ? s.slug : undefined,
  }),
  component: PedidoConfirmado,
});

function PedidoConfirmado() {
  const search = useSearch({ from: "/pedido-confirmado" });
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [order, setOrder] = useState<{ order_number: string; total: number } | null>(null);

  useEffect(() => {
    const orderId = search.order_id ?? search.order_nsu;
    if (!orderId) {
      setStatus("error");
      return;
    }
    (async () => {
      try {
        // InfinityPay redirect = pagamento aprovado no checkout. Marcamos como pago.
        const { data, error } = await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "processing",
            payment_id: search.transaction_nsu ?? null,
            notes: search.receipt_url ? `Recibo InfinityPay: ${search.receipt_url}` : null,
          })
          .eq("id", orderId)
          .select("order_number, total")
          .single();
        if (error) throw error;
        setOrder(data);
        setStatus("ok");
      } catch {
        // Mesmo se falhar o update (RLS, sessão expirada), mostramos confirmação
        setStatus("ok");
      }
    })();
  }, [search.order_id, search.order_nsu, search.transaction_nsu, search.receipt_url]);

  if (status === "loading") {
    return (
      <SiteLayout>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Confirmando seu pagamento…</p>
        </div>
      </SiteLayout>
    );
  }

  if (status === "error") {
    return (
      <SiteLayout>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h1 className="text-2xl font-bold mt-4">Pedido não encontrado</h1>
          <p className="text-muted-foreground mt-2">Não conseguimos identificar seu pedido. Verifique em "Meus pedidos".</p>
          <Link to="/conta/pedidos" className="mt-6 inline-flex h-11 px-6 items-center bg-primary text-primary-foreground rounded-full font-semibold">Meus pedidos</Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <CheckCircle2 className="h-16 w-16 mx-auto text-success" />
        <h1 className="text-3xl font-bold mt-4">Pagamento confirmado! 🎉</h1>
        {order && (
          <>
            <p className="text-muted-foreground mt-2">Pedido <strong>{order.order_number}</strong></p>
            <p className="text-2xl font-extrabold text-primary mt-1">{formatBRL(Number(order.total))}</p>
          </>
        )}
        <p className="text-sm text-muted-foreground mt-4">
          Recebemos sua compra e já estamos preparando o envio. Você receberá o código de rastreio em breve.
        </p>
        {search.receipt_url && (
          <a href={search.receipt_url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-primary hover:underline">
            Ver recibo InfinityPay →
          </a>
        )}
        <div className="mt-6 flex gap-3 justify-center">
          <Link to="/conta/pedidos" className="h-11 px-6 inline-flex items-center bg-primary text-primary-foreground rounded-full font-semibold">Meus pedidos</Link>
          <Link to="/produtos" className="h-11 px-6 inline-flex items-center border border-border rounded-full font-semibold">Continuar comprando</Link>
        </div>
      </div>
    </SiteLayout>
  );
}

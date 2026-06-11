import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { useAuth } from "@/hooks/use-auth";
import { useCart, useCartSubtotal } from "@/lib/cart-store";
import { formatBRL, formatCEP, formatPhone } from "@/lib/format";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout | Leve Mais Brasil" }] }),
  component: Checkout,
});

function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clear);
  const subtotal = useCartSubtotal();
  const [method, setMethod] = useState<"pix" | "credit_card">("pix");
  const [placing, setPlacing] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [form, setForm] = useState({
    recipient: "",
    phone: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  const total = method === "pix" ? subtotal * 0.9 : subtotal;
  const shipping = subtotal > 199 ? 0 : 19.9;
  const grandTotal = total + shipping;

  if (authLoading) {
    return <SiteLayout><div className="p-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div></SiteLayout>;
  }

  if (!user) {
    return (
      <SiteLayout>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Faça login para continuar</h1>
          <p className="text-muted-foreground mt-2">Você precisa de uma conta para finalizar a compra.</p>
          <Link to="/auth" className="mt-6 inline-flex h-11 px-6 items-center bg-primary text-primary-foreground rounded-full font-semibold">Entrar ou cadastrar</Link>
        </div>
      </SiteLayout>
    );
  }

  if (items.length === 0 && !orderNumber) {
    return (
      <SiteLayout>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Carrinho vazio</h1>
          <Link to="/produtos" className="mt-6 inline-flex h-11 px-6 items-center bg-primary text-primary-foreground rounded-full font-semibold">Ver produtos</Link>
        </div>
      </SiteLayout>
    );
  }

  if (orderNumber) {
    return (
      <SiteLayout>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <h1 className="text-2xl font-bold mt-4">Redirecionando para o pagamento…</h1>
          <p className="text-muted-foreground mt-2">Pedido <strong>{orderNumber}</strong> criado. Você será levado ao checkout seguro da InfinityPay.</p>
        </div>
      </SiteLayout>
    );
  }

  async function placeOrder() {
    setPlacing(true);
    try {
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user!.id,
          status: "pending",
          payment_method: method,
          payment_status: "pending",
          payment_provider: "infinitepay",
          subtotal,
          shipping_cost: shipping,
          discount: method === "pix" ? subtotal * 0.1 : 0,
          total: grandTotal,
          shipping_address: form,
        })
        .select()
        .single();
      if (orderErr) throw orderErr;

      const { error: itemsErr } = await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id,
          product_id: i.productId,
          product_title: i.title,
          product_image: i.image,
          unit_price: i.price,
          quantity: i.quantity,
          total: i.price * i.quantity,
        })),
      );
      if (itemsErr) throw itemsErr;

      // Monta itens para InfinityPay (preços em centavos)
      const ipItems = items.map((i) => ({
        name: i.title.slice(0, 60),
        price: Math.round(i.price * i.quantity * 100),
        quantity: 1,
      }));
      if (shipping > 0) ipItems.push({ name: "Frete", price: Math.round(shipping * 100), quantity: 1 });
      if (method === "pix" && subtotal * 0.1 > 0) {
        ipItems.push({ name: "Desconto Pix (10%)", price: -Math.round(subtotal * 0.1 * 100), quantity: 1 });
      }

      const redirectUrl = `${window.location.origin}/pedido-confirmado?order_id=${order.id}`;
      const url =
        `https://checkout.infinitepay.io/fluxogestao` +
        `?items=${encodeURIComponent(JSON.stringify(ipItems))}` +
        `&order_nsu=${encodeURIComponent(order.id)}` +
        `&redirect_url=${encodeURIComponent(redirectUrl)}`;

      clearCart();
      setOrderNumber(order.order_number);
      window.location.href = url;
    } catch (err) {
      alert("Erro ao registrar pedido: " + (err instanceof Error ? err.message : "tente novamente"));
    } finally {
      setPlacing(false);
    }
  }


  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Finalizar compra</h1>
        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-6">
            <section className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold mb-4">Endereço de entrega</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Nome de quem recebe" value={form.recipient} onChange={(v) => setForm({ ...form, recipient: v })} className="sm:col-span-2" />
                <Field label="Telefone" value={form.phone} onChange={(v) => setForm({ ...form, phone: formatPhone(v) })} />
                <Field label="CEP" value={form.cep} onChange={(v) => setForm({ ...form, cep: formatCEP(v) })} />
                <Field label="Rua" value={form.street} onChange={(v) => setForm({ ...form, street: v })} className="sm:col-span-2" />
                <Field label="Número" value={form.number} onChange={(v) => setForm({ ...form, number: v })} />
                <Field label="Complemento" value={form.complement} onChange={(v) => setForm({ ...form, complement: v })} />
                <Field label="Bairro" value={form.neighborhood} onChange={(v) => setForm({ ...form, neighborhood: v })} />
                <Field label="Cidade" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                <Field label="UF" value={form.state} onChange={(v) => setForm({ ...form, state: v.toUpperCase().slice(0, 2) })} />
              </div>
            </section>

            <section className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold mb-4">Forma de pagamento</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <PayOption label="Pix" desc="10% de desconto · aprovação imediata" selected={method === "pix"} onClick={() => setMethod("pix")} />
                <PayOption label="Cartão de crédito" desc="em até 12x sem juros" selected={method === "credit_card"} onClick={() => setMethod("credit_card")} />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                💳 Em breve: integração completa com Mercado Pago. Por enquanto, o pedido fica registrado e nossa equipe entra em contato para confirmação.
              </p>
            </section>
          </div>

          <aside className="bg-card border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-24">
            <h2 className="font-bold mb-4">Resumo</h2>
            <div className="space-y-2 text-sm max-h-48 overflow-y-auto mb-4">
              {items.map((i) => (
                <div key={i.productId} className="flex justify-between gap-2">
                  <span className="line-clamp-1">{i.quantity}× {i.title}</span>
                  <span className="font-medium shrink-0">{formatBRL(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <Row label="Subtotal" value={formatBRL(subtotal)} />
              <Row label="Frete" value={shipping === 0 ? "Grátis" : formatBRL(shipping)} />
              {method === "pix" && <Row label="Desconto Pix" value={`-${formatBRL(subtotal * 0.1)}`} success />}
            </div>
            <div className="border-t border-border mt-3 pt-3 flex justify-between items-baseline">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-extrabold text-primary">{formatBRL(grandTotal)}</span>
            </div>
            <button
              onClick={placeOrder}
              disabled={placing || !form.cep || !form.street}
              className="mt-5 w-full h-12 bg-primary text-primary-foreground rounded-full font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {placing && <Loader2 className="h-4 w-4 animate-spin" />}
              Finalizar pedido
            </button>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}

function Field({ label, value, onChange, className = "" }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
    </label>
  );
}

function PayOption({ label, desc, selected, onClick }: { label: string; desc: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`p-4 rounded-xl border-2 text-left transition ${selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
      <div className="font-semibold">{label}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
    </button>
  );
}

function Row({ label, value, success }: { label: string; value: string; success?: boolean }) {
  return (
    <div className={`flex justify-between ${success ? "text-success font-semibold" : ""}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

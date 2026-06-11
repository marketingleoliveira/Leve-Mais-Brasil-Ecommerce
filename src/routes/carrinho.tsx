import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { useCart, useCartSubtotal } from "@/lib/cart-store";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/carrinho")({
  head: () => ({ meta: [{ title: "Carrinho | Leve Mais Brasil" }] }),
  component: Cart,
});

function Cart() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCartSubtotal();
  const pixDiscount = subtotal * 0.1;

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold mb-8">Carrinho</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">Seu carrinho está vazio</h2>
            <p className="text-muted-foreground mt-2">Que tal dar uma olhada nos nossos destaques?</p>
            <Link to="/produtos" className="mt-6 inline-flex items-center gap-2 h-11 px-6 bg-primary text-primary-foreground rounded-full font-semibold">
              Ver produtos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            <div className="space-y-4">
              {items.map((it) => (
                <div key={it.productId} className="flex gap-4 p-4 bg-card border border-border rounded-2xl">
                  <Link to="/produto/$slug" params={{ slug: it.slug }} className="shrink-0">
                    <img src={it.image} alt={it.title} width={120} height={120} className="h-24 w-24 object-cover rounded-xl" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to="/produto/$slug" params={{ slug: it.slug }} className="font-semibold line-clamp-2 hover:text-primary">
                      {it.title}
                    </Link>
                    <div className="text-primary font-bold mt-1">{formatBRL(it.price)}</div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-border rounded-full">
                        <button onClick={() => setQty(it.productId, it.quantity - 1)} className="h-8 w-8 flex items-center justify-center hover:bg-secondary rounded-l-full"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-8 text-center text-sm font-semibold">{it.quantity}</span>
                        <button onClick={() => setQty(it.productId, it.quantity + 1)} className="h-8 w-8 flex items-center justify-center hover:bg-secondary rounded-r-full"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <button onClick={() => remove(it.productId)} className="text-sm text-destructive hover:underline inline-flex items-center gap-1">
                        <Trash2 className="h-4 w-4" /> Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-card border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-24">
              <h2 className="font-bold text-lg mb-4">Resumo</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatBRL(subtotal)}</span></div>
                <div className="flex justify-between"><span>Frete</span><span className="text-muted-foreground">Calcular</span></div>
                <div className="flex justify-between text-success font-semibold"><span>Pix (-10%)</span><span>-{formatBRL(pixDiscount)}</span></div>
              </div>
              <div className="my-4 border-t border-border" />
              <div className="flex justify-between items-baseline">
                <span className="font-semibold">Total no Pix</span>
                <span className="text-2xl font-extrabold text-primary">{formatBRL(subtotal - pixDiscount)}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">ou {formatBRL(subtotal)} em até 12x no cartão</div>
              <Link to="/checkout" className="mt-5 w-full h-12 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary-dark transition">
                Finalizar compra <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/produtos" className="mt-2 block text-center text-sm text-muted-foreground hover:text-primary">Continuar comprando</Link>
            </aside>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

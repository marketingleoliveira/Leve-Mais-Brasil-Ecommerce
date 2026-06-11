import { Link } from "@tanstack/react-router";
import { ShoppingCart, User, Search, Menu, X, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import logoAsset from "@/assets/logo.asset.json";
import { useCartCount } from "@/lib/cart-store";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const count = useCartCount();
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="ribbon-brasil h-1" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src={logoAsset.url}
              alt="Leve Mais Brasil"
              width={180}
              height={56}
              className="h-10 md:h-12 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <Link to="/" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>
              Início
            </Link>
            <Link to="/produtos" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>
              Produtos
            </Link>
            <Link to="/produtos" search={{ cat: "fitness" } as never} className="hover:text-primary transition-colors">
              Ofertas
            </Link>
            <a href="#sobre" className="hover:text-primary transition-colors">Sobre</a>
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <Link
              to="/produtos"
              className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary transition-colors"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden md:flex h-10 px-3 items-center gap-2 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </Link>
            )}
            <Link
              to={user ? "/conta" : "/auth"}
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              aria-label="Conta"
            >
              <User className="h-5 w-5" />
            </Link>
            <Link
              to="/carrinho"
              className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              aria-label="Carrinho"
            >
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <button
              type="button"
              className="md:hidden h-10 w-10 flex items-center justify-center rounded-full hover:bg-secondary"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="px-4 py-3 flex flex-col gap-3 text-sm font-medium">
            <Link to="/" onClick={() => setOpen(false)}>Início</Link>
            <Link to="/produtos" onClick={() => setOpen(false)}>Produtos</Link>
            <a href="#sobre" onClick={() => setOpen(false)}>Sobre</a>
            {isAdmin && (
              <Link to="/admin" onClick={() => setOpen(false)} className="text-accent-foreground font-semibold">
                Painel admin
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

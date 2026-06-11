import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { User, Package, MapPin, LogOut, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/_authenticated/conta")({
  head: () => ({ meta: [{ title: "Minha conta | Leve Mais Brasil" }] }),
  component: ContaLayout,
});

function ContaLayout() {
  const navigate = useNavigate();
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }
  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Minha conta</h1>
        <div className="grid lg:grid-cols-[240px_1fr] gap-8">
          <aside className="space-y-1">
            <NavLink to="/conta" icon={User} label="Perfil" />
            <NavLink to="/conta/pedidos" icon={Package} label="Pedidos" />
            <NavLink to="/conta/enderecos" icon={MapPin} label="Endereços" />
            <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm hover:bg-secondary text-destructive">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </aside>
          <div><Outlet /></div>
        </div>
      </div>
    </SiteLayout>
  );
}

function NavLink({ to, icon: Icon, label }: { to: string; icon: typeof ShoppingBag; label: string }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: true }}
      activeProps={{ className: "bg-primary text-primary-foreground" }}
      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm hover:bg-secondary"
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}

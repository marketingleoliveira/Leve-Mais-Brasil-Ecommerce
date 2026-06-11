import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingBag, Users, Truck, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    if (!roles?.some((r) => r.role === "admin")) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({ meta: [{ title: "Painel Admin | Leve Mais Brasil" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="min-h-screen bg-secondary/30 grid lg:grid-cols-[260px_1fr]">
      <aside className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border p-4">
        <Link to="/" className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Voltar à loja
        </Link>
        <div className="ribbon-brasil h-1 mb-4 rounded" />
        <h2 className="font-bold mb-4 px-3">Painel Admin</h2>
        <nav className="space-y-1">
          <AdminLink to="/admin" icon={LayoutDashboard} label="Dashboard" exact />
          <AdminLink to="/admin/produtos" icon={Package} label="Produtos" />
          <AdminLink to="/admin/pedidos" icon={ShoppingBag} label="Pedidos" />
          <AdminLink to="/admin/clientes" icon={Users} label="Clientes" />
          <AdminLink to="/admin/fornecedores" icon={Truck} label="Fornecedores" />
        </nav>
      </aside>
      <main className="p-6 lg:p-8"><Outlet /></main>
    </div>
  );
}

function AdminLink({ to, icon: Icon, label, exact }: { to: string; icon: typeof Package; label: string; exact?: boolean }) {
  return (
    <Link
      to={to}
      activeOptions={exact ? { exact: true } : undefined}
      activeProps={{ className: "bg-sidebar-primary text-sidebar-primary-foreground" }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-sidebar-accent"
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/conta/enderecos")({
  component: () => (
    <div className="bg-card border border-border rounded-2xl p-6 max-w-xl">
      <h2 className="font-bold text-lg">Endereços</h2>
      <p className="text-sm text-muted-foreground mt-2">
        Em breve você poderá salvar endereços para compras mais rápidas. Por enquanto, informe o endereço diretamente no checkout.
      </p>
    </div>
  ),
});

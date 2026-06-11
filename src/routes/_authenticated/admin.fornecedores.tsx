import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Supplier = {
  id: string;
  name: string;
  platform: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
};

export const Route = createFileRoute("/_authenticated/admin/fornecedores")({
  component: AdminFornecedores,
});

function AdminFornecedores() {
  const [list, setList] = useState<Supplier[]>([]);
  const [editing, setEditing] = useState<Partial<Supplier> | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase.from("suppliers").select("*").order("created_at", { ascending: false });
    setList((data ?? []) as Supplier[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing?.name) return alert("Nome obrigatório");
    const payload = {
      name: editing.name,
      platform: editing.platform || null,
      contact_email: editing.contact_email || null,
      contact_phone: editing.contact_phone || null,
      notes: editing.notes || null,
    };
    const { error } = editing.id
      ? await supabase.from("suppliers").update(payload).eq("id", editing.id)
      : await supabase.from("suppliers").insert(payload);
    if (error) return alert(error.message);
    setEditing(null);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Excluir fornecedor?")) return;
    await supabase.from("suppliers").delete().eq("id", id);
    await load();
  }

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Fornecedores</h1>
          <p className="text-muted-foreground text-sm">{list.length} cadastrados · AliExpress, CJ, locais</p>
        </div>
        <button onClick={() => setEditing({})} className="h-10 px-5 bg-primary text-primary-foreground rounded-full font-semibold inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Novo fornecedor
        </button>
      </div>

      {list.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
          Cadastre seus parceiros de dropshipping (AliExpress, CJ, fornecedores locais) para acompanhar custos e contatos.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {list.map((s) => (
            <div key={s.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold">{s.name}</h3>
                  {s.platform && <p className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1"><ExternalLink className="h-3 w-3" /> {s.platform}</p>}
                </div>
                <div>
                  <button onClick={() => setEditing(s)} className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-secondary"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => remove(s.id)} className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              {s.contact_email && <div className="text-sm mt-2">📧 {s.contact_email}</div>}
              {s.contact_phone && <div className="text-sm">📱 {s.contact_phone}</div>}
              {s.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{s.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editing.id ? "Editar" : "Novo"} fornecedor</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <F label="Nome" value={editing.name ?? ""} onChange={(v) => setEditing({ ...editing, name: v })} />
              <F label="Plataforma (AliExpress, CJ, etc)" value={editing.platform ?? ""} onChange={(v) => setEditing({ ...editing, platform: v })} />
              <F label="Email de contato" value={editing.contact_email ?? ""} onChange={(v) => setEditing({ ...editing, contact_email: v })} />
              <F label="Telefone / WhatsApp" value={editing.contact_phone ?? ""} onChange={(v) => setEditing({ ...editing, contact_phone: v })} />
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Notas</span>
                <textarea value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={3} className="mt-1 w-full p-3 rounded-lg border border-input bg-card text-sm" />
              </label>
            </div>
            <div className="mt-5 flex gap-3 justify-end">
              <button onClick={() => setEditing(null)} className="h-10 px-5 border border-border rounded-full font-semibold">Cancelar</button>
              <button onClick={save} className="h-10 px-5 bg-primary text-primary-foreground rounded-full font-bold">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-card text-sm" />
    </label>
  );
}

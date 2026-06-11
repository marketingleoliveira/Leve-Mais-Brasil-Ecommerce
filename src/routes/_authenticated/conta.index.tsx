import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPhone } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/conta/")({
  component: Perfil,
});

function Perfil() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState({ full_name: "", phone: "", cpf: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) setProfile({ full_name: data.full_name ?? "", phone: data.phone ?? "", cpf: data.cpf ?? "" });
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update(profile).eq("id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 max-w-xl">
      <h2 className="font-bold text-lg mb-4">Seus dados</h2>
      <div className="space-y-3">
        <Input label="Email" value={email} disabled />
        <Input label="Nome completo" value={profile.full_name} onChange={(v) => setProfile({ ...profile, full_name: v })} />
        <Input label="Telefone" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: formatPhone(v) })} />
        <Input label="CPF" value={profile.cpf} onChange={(v) => setProfile({ ...profile, cpf: v })} />
      </div>
      <button onClick={save} disabled={saving} className="mt-5 h-11 px-6 bg-primary text-primary-foreground rounded-full font-bold disabled:opacity-50 inline-flex items-center gap-2">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saved ? "Salvo!" : "Salvar alterações"}
      </button>
    </div>
  );
}

function Input({ label, value, onChange, disabled }: { label: string; value: string; onChange?: (v: string) => void; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-card disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-ring text-sm"
      />
    </label>
  );
}

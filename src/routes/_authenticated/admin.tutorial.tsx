import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, ShoppingCart, Package, Truck, MessageCircle, AlertTriangle, CheckCircle2, DollarSign } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/tutorial")({
  head: () => ({ meta: [{ title: "Tutorial Dropshipping | Painel Admin" }] }),
  component: AdminTutorial,
});

function AdminTutorial() {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Tutorial: Operação Dropshipping</h1>
          <p className="text-muted-foreground text-sm">Como comprar do fornecedor e enviar direto ao cliente final</p>
        </div>
      </div>

      <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4 my-6 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <strong>Regra de ouro:</strong> nunca envie nota fiscal, cartão de visita ou material com a marca do fornecedor. O cliente
          deve receber o pacote como se fosse enviado pela <strong>Leve Mais Brasil</strong>.
        </div>
      </div>

      <Section icon={ShoppingCart} step="1" title="Recebeu um pedido — e agora?">
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Abra a aba <strong>Pedidos</strong> no painel e localize o novo pedido (status: <em>pendente / pago</em>).</li>
          <li>Confira se o pagamento foi confirmado (InfinityPay envia notificação por e-mail).</li>
          <li>Copie o nome do produto, variação (cor / tamanho) e quantidade.</li>
          <li>Copie o endereço completo do cliente (CEP, rua, número, complemento, cidade, UF).</li>
          <li>Anote o ID do pedido — você vai usá-lo para rastrear depois.</li>
        </ol>
      </Section>

      <Section icon={Package} step="2" title="Comprando no fornecedor (Shopee / AliExpress / CJ)">
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Vá em <strong>Fornecedores</strong> no menu lateral e copie o link do produto cadastrado.</li>
          <li>Abra o link e adicione o produto ao carrinho na variação correta (atenção à cor/tamanho!).</li>
          <li>
            No checkout, preencha o <strong>endereço de entrega com os dados do CLIENTE</strong>, não os seus:
            <ul className="list-disc list-inside ml-5 mt-1 text-muted-foreground">
              <li>Nome: nome do cliente</li>
              <li>CPF: <strong>seu CPF</strong> (ou o do cliente, se ele autorizar — recomendado para evitar tributação)</li>
              <li>Telefone: telefone do cliente</li>
              <li>Endereço: endereço completo do cliente</li>
            </ul>
          </li>
          <li>Em "Observações" / "Mensagem ao vendedor", escreva sempre: <em>"Pedido sem nota fiscal, sem panfletos, sem brindes da loja. Embalagem neutra, por favor."</em></li>
          <li>Escolha o frete <strong>Shopee Xpress</strong> ou <strong>AliExpress Standard</strong> — mais barato e rastreável.</li>
          <li>Pague com seu cartão / PIX. Guarde o comprovante.</li>
        </ol>
      </Section>

      <Section icon={DollarSign} step="3" title="Margem e custos — confira antes de comprar">
        <div className="text-sm space-y-2">
          <p>Sua margem precisa cobrir:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Custo do produto + frete do fornecedor</li>
            <li>Taxa do InfinityPay (~4,99% no crédito + R$ 0,40 fixo)</li>
            <li>Imposto / Simples (~6%)</li>
            <li>Custos com marketing (Meta Ads, TikTok)</li>
            <li>Margem líquida mínima: <strong>35–40%</strong></li>
          </ul>
          <div className="bg-secondary rounded-lg p-3 mt-2">
            <strong>Exemplo:</strong> produto que você vende por R$ 89,90 e compra por R$ 28,50 →
            margem bruta de R$ 61,40 (68%) → após taxas e ads, lucro real ≈ R$ 30–35.
          </div>
        </div>
      </Section>

      <Section icon={Truck} step="4" title="Atualizando o pedido após a compra">
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Volte ao painel, abra o pedido e mude o status para <strong>"Em processamento"</strong>.</li>
          <li>Cole o <strong>código de rastreio</strong> do fornecedor no campo correspondente.</li>
          <li>O sistema envia automaticamente um e-mail ao cliente com o código.</li>
          <li>Quando o fornecedor enviar, mude para <strong>"Enviado"</strong>.</li>
          <li>Quando o cliente confirmar recebimento, mude para <strong>"Entregue"</strong>.</li>
        </ol>
      </Section>

      <Section icon={MessageCircle} step="5" title="Atendimento ao cliente — boas práticas">
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li><strong>Prazo:</strong> sempre informe 7–15 dias úteis (Shopee Xpress) ou 15–30 dias (AliExpress).</li>
          <li><strong>"Onde está meu pedido?":</strong> envie o link do rastreio + tela do status atual.</li>
          <li><strong>Produto com defeito:</strong> peça foto/vídeo, abra disputa no fornecedor e reenvie ou estorne para o cliente.</li>
          <li><strong>Cliente quer devolver:</strong> ofereça reembolso parcial antes de aceitar devolução (frete reverso é caro).</li>
          <li><strong>Avaliações:</strong> peça avaliação 5 estrelas 3 dias após a entrega — isso ajuda no ranking da loja.</li>
        </ul>
      </Section>

      <Section icon={CheckCircle2} step="6" title="Checklist diário">
        <ul className="space-y-1.5 text-sm">
          {[
            "Conferir novos pedidos pagos no painel",
            "Comprar dos fornecedores (manhã — para garantir despacho no mesmo dia)",
            "Atualizar status e códigos de rastreio dos pedidos do dia anterior",
            "Responder mensagens do WhatsApp / e-mail em até 4h",
            "Conferir estoque virtual: produtos esgotados no fornecedor devem ser desativados no painel",
            "Revisar campanhas de ads — pausar criativos com CPA acima da margem",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Section>

      <div className="bg-card border border-border rounded-2xl p-5 mt-6">
        <h3 className="font-bold mb-2">📎 Links úteis</h3>
        <ul className="text-sm space-y-1 text-primary">
          <li><a href="https://shopee.com.br" target="_blank" rel="noreferrer" className="hover:underline">Shopee Brasil</a> — fornecedor principal nacional</li>
          <li><a href="https://pt.aliexpress.com" target="_blank" rel="noreferrer" className="hover:underline">AliExpress</a> — variedade internacional</li>
          <li><a href="https://cjdropshipping.com" target="_blank" rel="noreferrer" className="hover:underline">CJ Dropshipping</a> — fulfillment com armazém no Brasil</li>
          <li><a href="https://infinitepay.io" target="_blank" rel="noreferrer" className="hover:underline">InfinityPay</a> — painel financeiro e antecipações</li>
        </ul>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  step,
  title,
  children,
}: {
  icon: typeof BookOpen;
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-card border border-border rounded-2xl p-5 my-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground inline-flex items-center justify-center font-bold text-sm">
          {step}
        </div>
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      <div className="pl-12">{children}</div>
    </section>
  );
}

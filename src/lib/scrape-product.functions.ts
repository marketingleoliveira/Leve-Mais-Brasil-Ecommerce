import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ScrapedProduct = {
  title: string;
  description: string;
  short_description: string;
  price: number | null;
  images: string[];
  source_url: string;
};

const schema = {
  type: "object",
  properties: {
    title: { type: "string", description: "Nome/título do produto" },
    description: { type: "string", description: "Descrição completa em texto puro, sem HTML" },
    short_description: { type: "string", description: "Resumo curto de 1-2 linhas" },
    price: { type: "number", description: "Preço em reais (apenas número, ex: 89.90)" },
    images: {
      type: "array",
      items: { type: "string" },
      description: "URLs absolutas (https) das imagens do produto, em ordem de relevância. Máximo 8.",
    },
  },
  required: ["title", "images"],
};

export const scrapeProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { url: string }) => {
    if (!input?.url || !/^https?:\/\//i.test(input.url)) throw new Error("URL inválida");
    return input;
  })
  .handler(async ({ data, context }): Promise<ScrapedProduct> => {
    // Admin only
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) throw new Error("FIRECRAWL_API_KEY não configurada");

    const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: data.url,
        formats: [
          "markdown",
          {
            type: "json",
            schema,
            prompt:
              "Extraia os dados do produto desta página de e-commerce. Para imagens, retorne apenas URLs absolutas (https) das fotos reais do produto (não logos, banners de site, ícones de pagamento ou avatares).",
          },
        ],
        onlyMainContent: true,
        waitFor: 1500,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Firecrawl ${res.status}: ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      data?: { json?: Partial<ScrapedProduct>; metadata?: { sourceURL?: string; title?: string } };
    };
    const extracted = json.data?.json ?? {};
    const images = Array.isArray(extracted.images)
      ? extracted.images.filter((u): u is string => typeof u === "string" && /^https?:\/\//i.test(u)).slice(0, 8)
      : [];

    return {
      title: extracted.title ?? json.data?.metadata?.title ?? "",
      description: extracted.description ?? "",
      short_description: extracted.short_description ?? "",
      price: typeof extracted.price === "number" ? extracted.price : null,
      images,
      source_url: data.url,
    };
  });

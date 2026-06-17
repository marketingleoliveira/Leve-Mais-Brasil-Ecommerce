import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const phone = "5511984749003";
  const message = encodeURIComponent(
    "Olá! Vim do site Leve Mais Brasil e gostaria de suporte personalizado.",
  );
  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp para suporte"
      className="fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 hover:bg-[#1ebe57] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
      <span className="hidden text-sm font-semibold sm:inline">Suporte no WhatsApp</span>
    </a>
  );
}

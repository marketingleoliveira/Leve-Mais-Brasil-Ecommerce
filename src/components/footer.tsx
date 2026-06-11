import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/logo.asset.json";
import { Instagram, Facebook, MessageCircle, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="ribbon-brasil h-1" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-10 md:grid-cols-4">
        <div>
          <img src={logoAsset.url} alt="Leve Mais Brasil" className="h-14 w-auto bg-white rounded-xl p-2" width={200} height={56} />
          <p className="mt-4 text-sm text-primary-foreground/80 max-w-xs">
            Mais produtos, mais conveniência, mais economia. Entregamos para todo o Brasil 🇧🇷
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Loja</h3>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/produtos" className="hover:text-accent">Todos os produtos</Link></li>
            <li><Link to="/produtos" className="hover:text-accent">Ofertas</Link></li>
            <li><Link to="/carrinho" className="hover:text-accent">Carrinho</Link></li>
            <li><Link to="/auth" className="hover:text-accent">Minha conta</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Ajuda</h3>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li><a href="#" className="hover:text-accent">Política de troca</a></li>
            <li><a href="#" className="hover:text-accent">Prazo de entrega</a></li>
            <li><a href="#" className="hover:text-accent">Formas de pagamento</a></li>
            <li><a href="#" className="hover:text-accent">Fale conosco</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Acompanhe</h3>
          <div className="flex gap-3">
            <a href="#" aria-label="Instagram" className="h-10 w-10 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition"><Instagram className="h-5 w-5" /></a>
            <a href="#" aria-label="Facebook" className="h-10 w-10 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition"><Facebook className="h-5 w-5" /></a>
            <a href="#" aria-label="WhatsApp" className="h-10 w-10 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition"><MessageCircle className="h-5 w-5" /></a>
            <a href="#" aria-label="Email" className="h-10 w-10 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition"><Mail className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-6 text-center text-xs text-primary-foreground/70 space-y-2">
        <div>© {new Date().getFullYear()} Leve Mais Brasil · CNPJ em breve · Todos os direitos reservados</div>
        <div>
          <Link to="/admin" className="text-primary-foreground/50 hover:text-accent underline-offset-2 hover:underline">
            Acesso de equipe
          </Link>
        </div>
      </div>
    </footer>
  );
}

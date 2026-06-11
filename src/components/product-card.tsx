import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { formatBRL, discountPercent } from "@/lib/format";
import { productImage } from "@/lib/product-images";

export type ProductCardData = {
  id: string;
  slug: string;
  title: string;
  short_description?: string | null;
  price: number | string;
  compare_at_price?: number | string | null;
  rating?: number | string | null;
  rating_count?: number | null;
  images?: string[] | null;
};

export function ProductCard({ p }: { p: ProductCardData }) {
  const price = Number(p.price);
  const compare = p.compare_at_price ? Number(p.compare_at_price) : null;
  const disc = discountPercent(price, compare);
  const rating = p.rating ? Number(p.rating) : 0;
  const img = productImage(p.slug, p.images?.[0]);

  return (
    <Link
      to="/produto/$slug"
      params={{ slug: p.slug }}
      className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all hover:-translate-y-1 flex flex-col"
    >
      <div className="relative aspect-square bg-secondary overflow-hidden">
        <img
          src={img}
          alt={p.title}
          loading="lazy"
          width={800}
          height={800}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {disc && (
          <span className="absolute top-3 left-3 badge-promo px-2.5 py-1 rounded-full text-xs">
            -{disc}%
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 min-h-10">{p.title}</h3>
        {rating > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
            <span>({p.rating_count ?? 0})</span>
          </div>
        )}
        <div className="mt-auto pt-3">
          {compare && (
            <div className="text-xs text-muted-foreground line-through">{formatBRL(compare)}</div>
          )}
          <div className="text-xl font-bold text-primary font-display">{formatBRL(price)}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            ou 12x de {formatBRL(price / 12)}
          </div>
        </div>
      </div>
    </Link>
  );
}

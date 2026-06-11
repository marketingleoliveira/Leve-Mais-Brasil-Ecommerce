// Maps product slugs to bundled local images so the seed data shows real product photos.
import earbuds from "@/assets/p-earbuds.jpg";
import smartwatch from "@/assets/p-smartwatch.jpg";
import blender from "@/assets/p-blender.jpg";
import ringlight from "@/assets/p-ringlight.jpg";
import neckfan from "@/assets/p-neckfan.jpg";
import carmount from "@/assets/p-carmount.jpg";
import massagegun from "@/assets/p-massagegun.jpg";
import petfeeder from "@/assets/p-petfeeder.jpg";

const map: Record<string, string> = {
  "fone-bluetooth-pro": earbuds,
  "smartwatch-fit-7": smartwatch,
  "mini-liquidificador-portatil": blender,
  "ring-light-13-tripe": ringlight,
  "mini-ventilador-portatil": neckfan,
  "suporte-magnetico-carro": carmount,
  "pistola-massagem-muscular": massagegun,
  "comedouro-automatico-pet": petfeeder,
};

export function productImage(slug: string, fallback?: string): string {
  return map[slug] ?? fallback ?? earbuds;
}

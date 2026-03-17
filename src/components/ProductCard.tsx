import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  const isAcai = product.category === "açaí";

  return (
    <button
      onClick={() => onAdd(product)}
      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-100 active:scale-[0.97] min-h-[120px] ${
        isAcai
          ? "border-primary/20 bg-primary/5 hover:border-primary hover:shadow-md"
          : "border-border bg-card hover:border-secondary hover:shadow-md"
      }`}
    >
      <span className="text-2xl mb-1">{isAcai ? "🍇" : "🥣"}</span>
      <span className="font-display font-bold text-sm text-center leading-tight">
        {product.name}
      </span>
      <span className={`text-base font-bold mt-1 ${isAcai ? "text-primary" : "text-secondary"}`}>
        R$ {Number(product.price).toFixed(2)}
      </span>
    </button>
  );
}

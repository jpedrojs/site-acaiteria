import { CartItem } from "@/types";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
}

export default function CartItemRow({ item, onUpdateQty, onRemove }: CartItemRowProps) {
  const subtotal = Number(item.product.price) * item.quantity;

  return (
    <div className="flex items-center gap-2 py-2 border-b border-border/50 animate-slide-in">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.product.name}</p>
        <p className="text-xs text-muted-foreground">
          R$ {Number(item.product.price).toFixed(2)} × {item.quantity}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdateQty(item.product.id, -1)}
          className="h-7 w-7 rounded-md bg-muted flex items-center justify-center hover:bg-destructive/10 transition-colors"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
        <button
          onClick={() => onUpdateQty(item.product.id, 1)}
          className="h-7 w-7 rounded-md bg-muted flex items-center justify-center hover:bg-secondary/20 transition-colors"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <span className="w-16 text-right font-bold text-sm">R$ {subtotal.toFixed(2)}</span>
      <button
        onClick={() => onRemove(item.product.id)}
        className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

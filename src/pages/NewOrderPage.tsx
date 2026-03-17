import { useState, useCallback } from "react";
import { useProducts, useCustomers, useCreateOrder, useSettings } from "@/core/controllers";
import { CartItem, Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import CartItemRow from "@/components/CartItemRow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ShoppingCart, Check, Search } from "lucide-react";

export default function NewOrderPage() {
  const { data: products, isLoading } = useProducts();
  const { data: customers } = useCustomers();
  const { data: settings } = useSettings();
  const createOrder = useCreateOrder();
  const tempoEstimado = Number(settings?.tempo_estimado_minutos ?? 20) || 20;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [observations, setObservations] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [showCustomerList, setShowCustomerList] = useState(false);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1, toppings: [] }];
    });
  }, []);

  const updateQty = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const total = cart.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast.error("Informe o nome do cliente");
      return;
    }
    if (cart.length === 0) {
      toast.error("Adicione itens ao pedido");
      return;
    }

    try {
      await createOrder.mutateAsync({
        customer_name: customerName.trim(),
        customer_id: customerId,
        total,
        tempo_estimado_minutos: tempoEstimado,
        observations: observations || undefined,
        items: cart.map((i) => ({
          product_id: i.product.id,
          product_name: i.product.name,
          quantity: i.quantity,
          unit_price: Number(i.product.price),
          subtotal: Number(i.product.price) * i.quantity,
          toppings: i.toppings.length > 0 ? i.toppings : undefined,
        })),
      });
      toast.success("Pedido criado com sucesso! 🎉");
      setCart([]);
      setCustomerName("");
      setCustomerId(undefined);
      setObservations("");
    } catch {
      toast.error("Erro ao criar pedido");
    }
  };

  const acaiProducts = products?.filter((p) => p.category === "açaí") ?? [];
  const complementos = products?.filter((p) => p.category === "complemento") ?? [];

  const filteredCustomers = customers?.filter((c) =>
    c.name.toLowerCase().includes(searchCustomer.toLowerCase())
  ) ?? [];

  const selectCustomer = (c: { id: string; name: string }) => {
    setCustomerName(c.name);
    setCustomerId(c.id);
    setShowCustomerList(false);
    setSearchCustomer("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Product Grid - Left */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="font-display font-bold text-lg mb-3">🍇 Açaí</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {acaiProducts.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={addToCart} />
          ))}
        </div>

        <h2 className="font-display font-bold text-lg mb-3">🥣 Complementos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {complementos.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={addToCart} />
          ))}
        </div>
      </div>

      {/* Order Sidebar - Right */}
      <div className="w-[380px] border-l bg-card flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-display font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Pedido Atual
          </h2>
        </div>

        {/* Customer */}
        <div className="p-4 border-b space-y-2 relative">
          <label className="text-xs font-medium text-muted-foreground">Cliente</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nome do cliente..."
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setSearchCustomer(e.target.value);
                setCustomerId(undefined);
                setShowCustomerList(true);
              }}
              onFocus={() => setShowCustomerList(true)}
              className="pl-9"
            />
          </div>
          {showCustomerList && searchCustomer && filteredCustomers.length > 0 && (
            <div className="absolute z-10 left-4 right-4 bg-card border rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {filteredCustomers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectCustomer(c)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                >
                  <span className="font-medium">{c.name}</span>
                  {c.phone && <span className="text-muted-foreground ml-2">· {c.phone}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {cart.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm mt-8">
              Toque nos produtos para adicionar
            </p>
          ) : (
            cart.map((item) => (
              <CartItemRow
                key={item.product.id}
                item={item}
                onUpdateQty={updateQty}
                onRemove={removeItem}
              />
            ))
          )}
        </div>

        {/* Observations */}
        {cart.length > 0 && (
          <div className="px-4 py-2 border-t">
            <Textarea
              placeholder="Observações..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="h-16 text-sm resize-none"
            />
          </div>
        )}

        {/* Total & Checkout */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex justify-between items-center mb-3">
            <span className="font-display font-bold text-lg">Total</span>
            <span className="font-display font-bold text-2xl text-primary">
              R$ {total.toFixed(2)}
            </span>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={cart.length === 0 || createOrder.isPending}
            className="w-full h-12 text-base font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            <Check className="h-5 w-5 mr-2" />
            {createOrder.isPending ? "Enviando..." : "Finalizar Pedido"}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts, useCreateOrder, useSettings, useSearchCustomerByPhone } from "@/core/controllers";
import { CartItem, Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import CartItemRow from "@/components/CartItemRow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ShoppingCart, Check, MapPin, Store, UserCheck } from "lucide-react";

export default function PedirPage() {
  const navigate = useNavigate();
  const { data: products, isLoading } = useProducts();
  const { data: settings } = useSettings();
  const createOrder = useCreateOrder();
  const searchCustomer = useSearchCustomerByPhone();

  const taxaEntregaVal = Number(settings?.taxa_entrega ?? 5) || 5;
  const tempoEstimadoVal = Number(settings?.tempo_estimado_minutos ?? 20) || 20;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tipo, setTipo] = useState<"retirada" | "entrega">("retirada");
  const [endereco, setEndereco] = useState("");
  const [observations, setObservations] = useState("");
  const [showSearchCustomer, setShowSearchCustomer] = useState(false);
  const [searchPhone, setSearchPhone] = useState("");
  const [customerId, setCustomerId] = useState<string | undefined>();

  const handleSearchCustomer = async () => {
    if (!searchPhone.trim()) return;
    try {
      const customer = await searchCustomer.mutateAsync(searchPhone.trim());
      if (customer) {
        setCustomerId(customer.id);
        setCustomerName(customer.name);
        setCustomerPhone(customer.phone || "");
        setEndereco(customer.address || "");
        setShowSearchCustomer(false);
        setSearchPhone("");
        toast.success("Dados preenchidos!");
      } else {
        toast.error("Cadastro não encontrado. Cadastre-se primeiro.");
      }
    } catch {
      toast.error("Erro ao buscar cadastro");
    }
  };

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

  const subtotal = cart.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
  const taxaEntrega = tipo === "entrega" ? taxaEntregaVal : 0;
  const total = subtotal + taxaEntrega;

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast.error("Informe seu nome");
      return;
    }
    if (!customerPhone.trim()) {
      toast.error("Informe seu telefone");
      return;
    }
    if (tipo === "entrega" && !endereco.trim()) {
      toast.error("Informe o endereço de entrega");
      return;
    }
    if (cart.length === 0) {
      toast.error("Adicione itens ao pedido");
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        customer_name: customerName.trim(),
        customer_id: customerId,
        customer_phone: customerPhone.trim(),
        total,
        observations: observations || undefined,
        endereco_entrega: tipo === "entrega" ? endereco.trim() : undefined,
        tipo,
        taxa_entrega: taxaEntrega,
        tempo_estimado_minutos: tempoEstimadoVal,
        items: cart.map((i) => ({
          product_id: i.product.id,
          product_name: i.product.name,
          quantity: i.quantity,
          unit_price: Number(i.product.price),
          subtotal: Number(i.product.price) * i.quantity,
          toppings: i.toppings.length > 0 ? i.toppings : undefined,
        })),
      });
      toast.success("Pedido realizado com sucesso! 🎉");
      navigate(`/pedido/${order.id}`, { replace: true });
    } catch {
      toast.error("Erro ao realizar pedido");
    }
  };

  const acaiProducts = products?.filter((p) => p.category === "açaí") ?? [];
  const complementos = products?.filter((p) => p.category === "complemento") ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Product Grid - Left */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display font-bold text-2xl mb-2 text-primary">🍇 Monte seu açaí</h1>
          <p className="text-muted-foreground mb-6">Escolha os itens e finalize seu pedido</p>

          <h2 className="font-display font-bold text-lg mb-3">Açaí</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {acaiProducts.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </div>

          <h2 className="font-display font-bold text-lg mb-3">Complementos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {complementos.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </div>
        </div>
      </div>

      {/* Cart & Checkout Sidebar - Right */}
      <div className="w-full md:w-[400px] border-l bg-card flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-display font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Seu Pedido
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
          {cart.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm mt-8">
              Toque nos produtos para adicionar
            </p>
          ) : (
            <>
              {cart.map((item) => (
                <CartItemRow
                  key={item.product.id}
                  item={item}
                  onUpdateQty={updateQty}
                  onRemove={removeItem}
                />
              ))}

              {/* Checkout form */}
              <div className="border-t pt-4 space-y-4">
                {!showSearchCustomer ? (
                  <button
                    type="button"
                    onClick={() => setShowSearchCustomer(true)}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <UserCheck className="h-4 w-4" />
                    Já sou cadastrado
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite seu telefone"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchCustomer()}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSearchCustomer}
                      disabled={searchCustomer.isPending}
                    >
                      Buscar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowSearchCustomer(false);
                        setSearchPhone("");
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Como deseja receber?</Label>
                  <RadioGroup
                    value={tipo}
                    onValueChange={(v) => setTipo(v as "retirada" | "entrega")}
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="retirada" id="retirada" />
                      <Label htmlFor="retirada" className="flex items-center gap-1.5 font-normal cursor-pointer">
                        <Store className="h-4 w-4" /> Retirada
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="entrega" id="entrega" />
                      <Label htmlFor="entrega" className="flex items-center gap-1.5 font-normal cursor-pointer">
                        <MapPin className="h-4 w-4" /> Entrega
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {tipo === "entrega" && (
                  <div>
                    <Label htmlFor="address">Endereço de entrega *</Label>
                    <Textarea
                      id="address"
                      placeholder="Rua, número, bairro, complemento..."
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      className="mt-1 min-h-[80px] resize-none"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="obs">Observações</Label>
                  <Textarea
                    id="obs"
                    placeholder="Alguma observação?"
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="mt-1 h-16 text-sm resize-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t bg-muted/30 space-y-2">
            {tipo === "entrega" && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa de entrega</span>
                <span>R$ {taxaEntregaVal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="font-display font-bold text-lg">Total</span>
              <span className="font-display font-bold text-2xl text-primary">
                R$ {total.toFixed(2)}
              </span>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={createOrder.isPending}
              className="w-full h-12 text-base font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Check className="h-5 w-5 mr-2" />
              {createOrder.isPending ? "Enviando..." : "Finalizar Pedido"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

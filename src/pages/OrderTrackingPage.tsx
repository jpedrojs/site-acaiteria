import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useOrder } from "@/core/controllers";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, Clock, ChefHat, Truck, XCircle, ArrowLeft } from "lucide-react";

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; color: string; description: string }
> = {
  pending: {
    label: "Pendente",
    icon: Clock,
    color: "bg-amber-100 text-amber-800 border-amber-200",
    description: "Seu pedido foi recebido e está na fila",
  },
  preparing: {
    label: "Preparando",
    icon: ChefHat,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Estamos preparando seu açaí!",
  },
  ready: {
    label: "Pronto",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Seu pedido está pronto para retirada ou entrega",
  },
  delivered: {
    label: "Entregue",
    icon: Truck,
    color: "bg-slate-100 text-slate-700 border-slate-200",
    description: "Pedido entregue. Bom apetite! 🍇",
  },
  cancelled: {
    label: "Cancelado",
    icon: XCircle,
    color: "bg-red-100 text-red-800 border-red-200",
    description: "Este pedido foi cancelado",
  },
};

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: order, isLoading, error } = useOrder(id);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`order-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["order", id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <p className="text-muted-foreground text-center mb-4">
          Pedido não encontrado ou o link pode estar incorreto.
        </p>
        <Link to="/pedir">
          <Button variant="outline">Fazer um novo pedido</Button>
        </Link>
      </div>
    );
  }

  const cfg = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = cfg.icon;
  const items = (order as { order_items?: { product_name: string; quantity: number }[] }).order_items ?? [];

  return (
    <div className="max-w-lg mx-auto p-4 md:p-6">
      <Link
        to="/pedir"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para pedir
      </Link>

      <div className="bg-card border rounded-2xl p-6 shadow-sm">
        <div className="text-center mb-6">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-2 mb-3 ${cfg.color}`}
          >
            <StatusIcon className="h-8 w-8" />
          </div>
          <h1 className="font-display font-bold text-xl mb-1">Pedido #{order.id.slice(0, 8)}</h1>
          <Badge className={`${cfg.color} border`}>{cfg.label}</Badge>
          <p className="text-sm text-muted-foreground mt-2">{cfg.description}</p>
        </div>

        <div className="space-y-4 border-t pt-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Cliente</p>
            <p className="font-medium">{order.customer_name}</p>
            {order.customer_phone && (
              <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">Data e hora</p>
            <p className="text-sm">
              {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">Itens</p>
            <ul className="text-sm space-y-1 mt-1">
              {items.map((item: { product_name: string; quantity: number }, idx: number) => (
                <li key={idx}>
                  {item.quantity}× {item.product_name}
                </li>
              ))}
            </ul>
          </div>

          {(order as { endereco_entrega?: string | null }).endereco_entrega && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Endereço de entrega</p>
              <p className="text-sm">{(order as { endereco_entrega?: string }).endereco_entrega}</p>
            </div>
          )}

          {order.observations && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Observações</p>
              <p className="text-sm italic">{order.observations}</p>
            </div>
          )}

          {(order as { tempo_estimado_minutos?: number | null }).tempo_estimado_minutos &&
            order.status !== "delivered" &&
            order.status !== "cancelled" && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Tempo estimado: ~{(order as { tempo_estimado_minutos: number }).tempo_estimado_minutos} min</span>
              </div>
            )}

          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-display font-bold">Total</span>
            <span className="font-display font-bold text-xl text-primary">
              R$ {Number(order.total).toFixed(2)}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Esta página atualiza automaticamente. Salve o link para acompanhar seu pedido.
        </p>
      </div>
    </div>
  );
}

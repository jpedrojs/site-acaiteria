import { useState, useMemo } from "react";
import { useOrders, useUpdateOrderStatus } from "@/core/controllers";
import type { OrderWithItemsDTO } from "@/core/dto";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, MapPin } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; next?: string; nextLabel?: string }> = {
  pending: { label: "Pendente", color: "bg-accent text-accent-foreground", next: "preparing", nextLabel: "Preparar" },
  preparing: { label: "Preparando", color: "bg-primary text-primary-foreground", next: "ready", nextLabel: "Pronto" },
  ready: { label: "Pronto", color: "bg-secondary text-secondary-foreground", next: "delivered", nextLabel: "Entregue" },
  delivered: { label: "Entregue", color: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelado", color: "bg-destructive/20 text-destructive" },
};

const FILTER_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "today", label: "Hoje" },
  { value: "3days", label: "Últimos 3 dias" },
  { value: "7days", label: "Última semana" },
];

function filterByDate(orders: OrderWithItemsDTO[], filter: string): OrderWithItemsDTO[] {
  if (filter === "all") return orders;
  const now = new Date();
  const start = filter === "today"
    ? startOfDay(now)
    : filter === "3days"
    ? startOfDay(subDays(now, 3))
    : startOfDay(subDays(now, 7));
  const end = endOfDay(now);
  return orders.filter((o) => {
    const d = new Date(o.created_at);
    return d >= start && d <= end;
  });
}

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [detailOrder, setDetailOrder] = useState<OrderWithItemsDTO | null>(null);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    let list = orders as OrderWithItemsDTO[];
    list = filterByDate(list, dateFilter);
    if (statusFilter !== "all") {
      list = list.filter((o) => o.status === statusFilter);
    }
    return list;
  }, [orders, statusFilter, dateFilter]);

  const handleStatusChange = (order: OrderWithItemsDTO, newStatus: string) => {
    updateStatus.mutate({
      id: order.id,
      status: newStatus as OrderWithItemsDTO["status"],
      order: {
        customer_name: order.customer_name,
        customer_phone: order.customer_phone ?? null,
        total: Number(order.total),
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="font-display font-bold text-xl mb-4">📋 Pedidos</h2>

      <div className="flex flex-wrap gap-4 mb-4">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending">Pendente</TabsTrigger>
            <TabsTrigger value="preparing">Preparando</TabsTrigger>
            <TabsTrigger value="ready">Pronto</TabsTrigger>
            <TabsTrigger value="delivered">Entregue</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-muted-foreground text-center mt-12">Nenhum pedido encontrado</p>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const cfg = statusConfig[order.status] || statusConfig.pending;
            const items = order.order_items ?? [];
            return (
              <div
                key={order.id}
                onClick={() => setDetailOrder(order)}
                className="bg-card border rounded-xl p-4 animate-pop-in cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-display font-bold">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cfg.color}>{cfg.label}</Badge>
                    <span className="font-display font-bold text-primary">
                      R$ {Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground mb-2">
                  {items.map((item: { id: string; product_name: string; quantity: number }) => (
                    <span key={item.id} className="mr-3">
                      {item.quantity}× {item.product_name}
                    </span>
                  ))}
                </div>

                {order.tipo === "entrega" && (
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {order.endereco_entrega || "—"}
                  </div>
                )}
                {Number(order.taxa_entrega || 0) > 0 && (
                  <div className="text-xs text-muted-foreground mb-1">
                    Taxa de entrega: R$ {Number(order.taxa_entrega).toFixed(2)}
                  </div>
                )}
                {order.tempo_estimado_minutos && order.status !== "delivered" && order.status !== "cancelled" && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~{order.tempo_estimado_minutos} min
                  </div>
                )}

                <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={order.status}
                    onValueChange={(newStatus) => handleStatusChange(order, newStatus)}
                    disabled={updateStatus.isPending || order.status === "delivered" || order.status === "cancelled"}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Alterar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="preparing">Preparando</SelectItem>
                      <SelectItem value="ready">Pronto</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!detailOrder} onOpenChange={() => setDetailOrder(null)}>
        <DialogContent className="max-w-md">
          {detailOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">
                  Pedido — {detailOrder.customer_name}
                </DialogTitle>
              </DialogHeader>
              <Badge
                className={
                  detailOrder.tipo === "entrega"
                    ? "bg-primary text-primary-foreground text-sm px-3 py-1 mb-2"
                    : "bg-secondary text-secondary-foreground text-sm px-3 py-1 mb-2"
                }
              >
                {detailOrder.tipo === "entrega" ? "🚚 Entrega" : "🏪 Retirada"}
              </Badge>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  {format(new Date(detailOrder.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
                <div>
                  <p className="font-medium text-muted-foreground">Itens</p>
                  <ul className="mt-1">
                    {(detailOrder.order_items ?? []).map((item: { id: string; product_name: string; quantity: number }) => (
                      <li key={item.id}>
                        {item.quantity}× {item.product_name}
                      </li>
                    ))}
                  </ul>
                </div>
                {detailOrder.customer_phone && (
                  <p>Telefone: {detailOrder.customer_phone}</p>
                )}
                {detailOrder.tipo === "entrega" && detailOrder.endereco_entrega && (
                  <div>
                    <p className="font-medium text-muted-foreground">Endereço</p>
                    <p>{detailOrder.endereco_entrega}</p>
                  </div>
                )}
                {detailOrder.observations && (
                  <p className="italic">Obs: {detailOrder.observations}</p>
                )}
                {detailOrder.tempo_estimado_minutos && detailOrder.status !== "delivered" && detailOrder.status !== "cancelled" && (
                  <p className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Tempo estimado: ~{detailOrder.tempo_estimado_minutos} min
                  </p>
                )}
                <p className="font-display font-bold text-lg text-primary">
                  Total: R$ {Number(detailOrder.total).toFixed(2)}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

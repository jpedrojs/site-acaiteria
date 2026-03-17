import { useState } from "react";
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer, useOrdersByCustomer } from "@/core/controllers";
import type { OrderWithItemsDTO, CustomerDTO } from "@/core/dto";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Pencil, Trash2, Search, History } from "lucide-react";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  preparing: "Preparando",
  ready: "Pronto",
  delivered: "Entregue",
  cancelled: "Cancelado",
};


export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [historyCustomer, setHistoryCustomer] = useState<{ id: string; name: string } | null>(null);
  const { data: customers, isLoading, error } = useCustomers();
  const { data: customerOrders, isLoading: ordersLoading } = useOrdersByCustomer(historyCustomer?.id);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const filtered = customers?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  ) ?? [];

  const openNew = () => {
    setEditingId(null);
    setForm({ name: "", phone: "", email: "", address: "" });
    setDialogOpen(true);
  };

  const openEdit = (c: CustomerDTO) => {
    setEditingId(c.id);
    setForm({ name: c.name, phone: c.phone || "", email: c.email || "", address: c.address || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    try {
      if (editingId) {
        await updateCustomer.mutateAsync({ id: editingId, ...form });
        toast.success("Cliente atualizado!");
      } else {
        await createCustomer.mutateAsync(form);
        toast.success("Cliente cadastrado!");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Erro ao salvar cliente");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer.mutateAsync(id);
      toast.success("Cliente removido");
    } catch {
      toast.error("Erro ao remover cliente");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-destructive">Erro ao carregar clientes: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl">👥 Clientes</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-1" /> Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingId ? "Editar Cliente" : "Novo Cliente"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <Input
                placeholder="Nome *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Telefone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                placeholder="Endereço"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              <Button onClick={handleSave} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold">
                {editingId ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center mt-12">Nenhum cliente encontrado</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c.id} className="bg-card border rounded-xl p-4 flex items-center gap-4 animate-pop-in">
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold truncate">{c.name}</p>
                <p className="text-sm text-muted-foreground">
                  {[c.phone, c.email].filter(Boolean).join(" · ") || "Sem contato"}
                </p>
                {c.address && (
                  <p className="text-xs text-muted-foreground truncate">{c.address}</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHistoryCustomer({ id: c.id, name: c.name })}
                className="h-9"
              >
                <History className="h-4 w-4 mr-1" />
                Histórico
              </Button>
              <button
                onClick={() => openEdit(c)}
                className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!historyCustomer} onOpenChange={() => setHistoryCustomer(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico — {historyCustomer?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : !customerOrders?.length ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum pedido encontrado para este cliente.
              </p>
            ) : (
              <div className="space-y-3">
                {customerOrders.map((order: OrderWithItemsDTO) => (
                  <div
                    key={order.id}
                    className="bg-muted/30 rounded-lg p-3 border border-border/50"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {statusLabels[order.status] ?? order.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {(order.order_items ?? []).slice(0, 3).map((item: { id: string; product_name: string; quantity: number }) => (
                        <span key={item.id} className="mr-2">
                          {item.quantity}× {item.product_name}
                        </span>
                      ))}
                      {(order.order_items?.length ?? 0) > 3 && (
                        <span className="text-muted-foreground/70">+{(order.order_items?.length ?? 0) - 3} itens</span>
                      )}
                    </div>
                    <p className="font-display font-bold text-primary">
                      R$ {Number(order.total).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

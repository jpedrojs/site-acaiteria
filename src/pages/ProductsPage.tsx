import { useState, useEffect } from "react";
import {
  useProductsAll,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useSettings,
  useUpdateSetting,
} from "@/core/controllers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package, Settings } from "lucide-react";

const CATEGORIES = [
  { value: "açaí", label: "Açaí" },
  { value: "complemento", label: "Complemento" },
];

export default function ProductsPage() {
  const { data: products, isLoading } = useProductsAll();
  const { data: settings } = useSettings();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateSetting = useUpdateSetting();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "açaí",
    description: "",
    active: true,
  });
  const [localTaxa, setLocalTaxa] = useState("5");
  const [localTempo, setLocalTempo] = useState("20");

  const openNew = () => {
    setEditingId(null);
    setForm({ name: "", price: "", category: "açaí", description: "", active: true });
    setDialogOpen(true);
  };

  const openEdit = (p: { id: string; name: string; price: number; category: string; description?: string | null; active: boolean }) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: String(p.price),
      category: p.category,
      description: p.description || "",
      active: p.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    const price = parseFloat(form.price) || 0;
    if (price < 0) {
      toast.error("Preço inválido");
      return;
    }
    try {
      if (editingId) {
        await updateProduct.mutateAsync({
          id: editingId,
          name: form.name.trim(),
          price,
          category: form.category,
          description: form.description || undefined,
          active: form.active,
        });
        toast.success("Produto atualizado!");
      } else {
        await createProduct.mutateAsync({
          name: form.name.trim(),
          price,
          category: form.category,
          description: form.description || undefined,
          active: form.active,
        });
        toast.success("Produto cadastrado!");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Erro ao salvar produto");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Produto removido");
    } catch {
      toast.error("Erro ao remover produto");
    }
  };

  useEffect(() => {
    if (settings) {
      setLocalTaxa(settings.taxa_entrega ?? "5");
      setLocalTempo(settings.tempo_estimado_minutos ?? "20");
    }
  }, [settings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const acai = products?.filter((p) => p.category === "açaí") ?? [];
  const complementos = products?.filter((p) => p.category === "complemento") ?? [];

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl">📦 Produtos</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-1" /> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingId ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Açaí 500ml"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="desc">Descrição</Label>
                <Input
                  id="desc"
                  placeholder="Opcional"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  checked={form.active}
                  onCheckedChange={(v) => setForm({ ...form, active: v })}
                />
                <Label htmlFor="active" className="font-normal">Ativo (visível na loja)</Label>
              </div>
              <Button
                onClick={handleSave}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold"
              >
                {editingId ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 p-4 border rounded-xl bg-muted/30">
        <h3 className="font-display font-bold flex items-center gap-2 mb-3">
          <Settings className="h-4 w-4" /> Configurações
        </h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <Label className="text-xs">Taxa de entrega (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={localTaxa}
              onChange={(e) => setLocalTaxa(e.target.value)}
              onBlur={() => updateSetting.mutate({ key: "taxa_entrega", value: localTaxa || "0" })}
              className="w-24 h-9 mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Tempo estimado (min)</Label>
            <Input
              type="number"
              min="1"
              value={localTempo}
              onChange={(e) => setLocalTempo(e.target.value)}
              onBlur={() => updateSetting.mutate({ key: "tempo_estimado_minutos", value: localTempo || "20" })}
              className="w-24 h-9 mt-1"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-display font-bold text-lg mb-3">🍇 Açaí</h3>
          {acai.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum produto</p>
          ) : (
            <div className="space-y-2">
              {acai.map((p) => (
                <div
                  key={p.id}
                  className={`bg-card border rounded-xl p-4 flex items-center gap-4 animate-pop-in ${!p.active ? "opacity-60" : ""}`}
                >
                  <Package className="h-5 w-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold truncate">{p.name}</p>
                    <p className="text-sm text-muted-foreground">
                      R$ {Number(p.price).toFixed(2)}
                      {!p.active && " · Inativo"}
                    </p>
                  </div>
                  <button
                    onClick={() => openEdit(p)}
                    className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-display font-bold text-lg mb-3">🥣 Complementos</h3>
          {complementos.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum produto</p>
          ) : (
            <div className="space-y-2">
              {complementos.map((p) => (
                <div
                  key={p.id}
                  className={`bg-card border rounded-xl p-4 flex items-center gap-4 animate-pop-in ${!p.active ? "opacity-60" : ""}`}
                >
                  <Package className="h-5 w-5 text-secondary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold truncate">{p.name}</p>
                    <p className="text-sm text-muted-foreground">
                      R$ {Number(p.price).toFixed(2)}
                      {!p.active && " · Inativo"}
                    </p>
                  </div>
                  <button
                    onClick={() => openEdit(p)}
                    className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

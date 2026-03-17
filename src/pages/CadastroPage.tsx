import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCreateCustomer } from "@/core/controllers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function CadastroPage() {
  const navigate = useNavigate();
  const createCustomer = useCreateCustomer();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    try {
      await createCustomer.mutateAsync({
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
      });
      toast.success("Cadastro realizado com sucesso! 🎉");
      navigate("/pedir", { replace: true });
    } catch {
      toast.error("Erro ao cadastrar. Tente novamente.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Link
        to="/loja"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="bg-card border rounded-2xl p-6 shadow-sm">
        <h1 className="font-display font-bold text-2xl mb-2">Cadastrar-se</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Crie seu cadastro para agilizar seus pedidos. Seus dados serão preenchidos automaticamente na próxima vez.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              placeholder="(00) 00000-0000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              placeholder="Rua, número, bairro..."
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="mt-1"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-12 text-base font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            disabled={createCustomer.isPending}
          >
            {createCustomer.isPending ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Já tem cadastro?{" "}
          <Link to="/pedir" className="text-primary hover:underline">
            Pedir online
          </Link>
        </p>
      </div>
    </div>
  );
}

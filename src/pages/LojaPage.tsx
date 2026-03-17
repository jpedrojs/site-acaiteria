import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, UserPlus, Search } from "lucide-react";

export default function LojaPage() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      navigate(`/pedido/${orderId.trim()}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div>
          <h1 className="font-display font-bold text-4xl text-primary mb-2">
            🍇 Açaí Flow
          </h1>
          <p className="text-muted-foreground text-lg">
            O melhor açaí da região. Peça online e receba em casa ou retire no local.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/pedir">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-primary hover:bg-primary/90">
              <Store className="h-6 w-6 mr-2" />
              Pedir online
            </Button>
          </Link>
          <Link to="/cadastro">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg">
              <UserPlus className="h-6 w-6 mr-2" />
              Cadastrar-se
            </Button>
          </Link>
        </div>

        <div className="border-t pt-8 mt-8">
          <h2 className="font-display font-bold text-lg mb-3">Acompanhar pedido</h2>
          <p className="text-sm text-muted-foreground mb-2">
            Digite o código do pedido para acompanhar o status
          </p>
          <form onSubmit={handleTrackOrder} className="flex gap-2 max-w-md mx-auto">
            <Input
              placeholder="Ex: abc123..."
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="secondary" aria-label="Buscar pedido">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";

// Exemplo estático. Depois, troque por dados do backend/Supabase
const mesas = Array.from({ length: 20 }, (_, i) => ({
  numero: i + 1,
  status: "disponivel", // ou "ocupada"
  garcom: "Renato Almeida",
  tempo: "00h00m",
  total: "R$ 0,00"
}));

export default function MesasPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mesas</h1>
      <div className="grid grid-cols-5 gap-4">
        {mesas.map((mesa) => (
          <div
            key={mesa.numero}
            className={`border rounded-lg p-4 cursor-pointer shadow-md transition-all duration-150 hover:scale-105 ${mesa.status === "ocupada" ? "bg-red-100 border-red-400" : "bg-green-100 border-green-400"}`}
            onClick={() => navigate(`/mesa/${mesa.numero}`)}
          >
            <div className="text-lg font-bold mb-2">Mesa {mesa.numero.toString().padStart(2, '0')}</div>
            <div>Status: <span className={mesa.status === "ocupada" ? "text-red-600" : "text-green-600"}>{mesa.status === "ocupada" ? "Ocupada" : "Disponível"}</span></div>
            {mesa.status === "ocupada" && (
              <>
                <div>Garçom: {mesa.garcom}</div>
                <div>Tempo: {mesa.tempo}</div>
                <div>Total: {mesa.total}</div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 flex gap-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700"
          onClick={() => window.location.href = '/balcao'}
        >
          Novo Pedido no Balcão
        </button>
      </div>
    </div>
  );
}

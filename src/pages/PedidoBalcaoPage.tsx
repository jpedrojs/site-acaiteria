// Esta é a tela de pedido avulso/balcão (igual à tela antiga)
export default function PedidoBalcaoPage() {
  // Exemplo estático. Depois, troque por lógica real do pedido do balcão
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pedido no Balcão</h1>
      {/* Reaproveite aqui os componentes já existentes do pedido avulso */}
      <div className="bg-white rounded-lg p-4 shadow">
        <p>Adicione produtos, finalize e registre o pedido normalmente.</p>
      </div>
    </div>
  );
}

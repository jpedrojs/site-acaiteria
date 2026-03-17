import { useParams } from "react-router-dom";
import { useTableOrders, ProductOrderItem, AcaiCupOrderItem } from "@/context/TableOrdersContext";
import { useProducts } from "@/core/controllers/useProductController";
import { useState } from "react";

function getTotal(order: { products: ProductOrderItem[]; acaiCups: AcaiCupOrderItem[] }) {
  const prod = order.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const acai = order.acaiCups.reduce((sum, c) => sum + c.price * c.quantity, 0);
  return prod + acai;
}

export default function PedidoMesaPage() {
  const { id } = useParams();
  const { tableOrders, setTableOrder } = useTableOrders();
  const { data: products = [] } = useProducts();
  const tableId = id || "1";
  const order = tableOrders[tableId] || { products: [], acaiCups: [], observation: "" };

  // Popup states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAcaiModal, setShowAcaiModal] = useState(false);

  // --- Adicionar Produto Modal ---
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  function openProductModal() {
    setProductQuantities({});
    setShowProductModal(true);
  }
  function confirmAddProducts() {
    const toAdd = products.filter(p => productQuantities[p.id] > 0).map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      quantity: productQuantities[p.id],
    }));
    // Merge with existing
    const merged = [...order.products];
    toAdd.forEach(item => {
      const idx = merged.findIndex(p => p.id === item.id);
      if (idx >= 0) merged[idx].quantity += item.quantity;
      else merged.push(item);
    });
    setTableOrder(tableId, { ...order, products: merged });
    setShowProductModal(false);
  }

  // --- Adicionar Copo de Açaí Modal ---
  const [cupSize, setCupSize] = useState<string>("");
  const [cupIngredients, setCupIngredients] = useState<string[]>([]);
  function openAcaiModal() {
    setCupSize("");
    setCupIngredients([]);
    setShowAcaiModal(true);
  }
  function confirmAddAcaiCup() {
    if (!cupSize) return;
    // Preço exemplo: tamanho + 2 por ingrediente
    const sizePrice = cupSize === "300ml" ? 12 : cupSize === "500ml" ? 18 : 24;
    const price = sizePrice + cupIngredients.length * 2;
    const cup: AcaiCupOrderItem = {
      id: Math.random().toString(36).slice(2),
      size: cupSize,
      ingredients: cupIngredients,
      price,
      quantity: 1,
    };
    setTableOrder(tableId, { ...order, acaiCups: [...order.acaiCups, cup] });
    setShowAcaiModal(false);
  }

  // --- Edit/Remove ---
  function updateProductQty(idx: number, delta: number) {
    const arr = [...order.products];
    arr[idx].quantity = Math.max(1, arr[idx].quantity + delta);
    setTableOrder(tableId, { ...order, products: arr });
  }
  function removeProduct(idx: number) {
    const arr = [...order.products];
    arr.splice(idx, 1);
    setTableOrder(tableId, { ...order, products: arr });
  }
  function updateAcaiQty(idx: number, delta: number) {
    const arr = [...order.acaiCups];
    arr[idx].quantity = Math.max(1, arr[idx].quantity + delta);
    setTableOrder(tableId, { ...order, acaiCups: arr });
  }
  function removeAcai(idx: number) {
    const arr = [...order.acaiCups];
    arr.splice(idx, 1);
    setTableOrder(tableId, { ...order, acaiCups: arr });
  }

  // --- Observação ---
  function updateObs(obs: string) {
    setTableOrder(tableId, { ...order, observation: obs });
  }

  return (
    <div className="flex p-6 gap-8">
      <div className="w-80 bg-gray-100 rounded-lg p-4">
        <div className="text-xl font-bold mb-2">Mesa {tableId}</div>
        <div>Garçom: Operador</div>
        <div className="mt-4">
          <label className="block font-bold mb-1">Observação:</label>
          <textarea
            className="w-full rounded border p-1"
            rows={2}
            value={order.observation}
            onChange={e => updateObs(e.target.value)}
          />
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <button className="bg-blue-600 text-white px-3 py-2 rounded font-bold hover:bg-blue-700" onClick={openProductModal}>
            Adicionar Produto
          </button>
          <button className="bg-purple-600 text-white px-3 py-2 rounded font-bold hover:bg-purple-700" onClick={openAcaiModal}>
            Adicionar Copo de Açaí
          </button>
        </div>
      </div>
      <div className="flex-1 bg-white rounded-lg p-4 shadow">
        <h2 className="text-lg font-bold mb-2">Produtos</h2>
        <table className="w-full mb-4">
          <thead>
            <tr className="border-b">
              <th className="text-left">Produto</th>
              <th>Qtd</th>
              <th>Preço</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {order.products.map((item, i) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td className="text-center">
                  <button onClick={() => updateProductQty(i, -1)} className="px-2">-</button>
                  {item.quantity}
                  <button onClick={() => updateProductQty(i, 1)} className="px-2">+</button>
                </td>
                <td className="text-center">R$ {item.price.toFixed(2)}</td>
                <td className="text-center">R$ {(item.price * item.quantity).toFixed(2)}</td>
                <td><button onClick={() => removeProduct(i)} className="text-red-600 font-bold">Excluir</button></td>
              </tr>
            ))}
            {order.acaiCups.map((cup, i) => (
              <tr key={cup.id} className="bg-purple-50">
                <td>
                  <div className="font-bold">Copo de Açaí {cup.size}</div>
                  <div className="text-xs text-gray-600">Ingredientes: {cup.ingredients.join(", ")}</div>
                </td>
                <td className="text-center">
                  <button onClick={() => updateAcaiQty(i, -1)} className="px-2">-</button>
                  {cup.quantity}
                  <button onClick={() => updateAcaiQty(i, 1)} className="px-2">+</button>
                </td>
                <td className="text-center">R$ {cup.price.toFixed(2)}</td>
                <td className="text-center">R$ {(cup.price * cup.quantity).toFixed(2)}</td>
                <td><button onClick={() => removeAcai(i)} className="text-red-600 font-bold">Excluir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center">
          <div className="font-bold text-xl">Total: R$ {getTotal(order).toFixed(2)}</div>
          <button className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700">Pagamento</button>
        </div>
      </div>

      {/* Modal Adicionar Produto */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
            <h2 className="text-lg font-bold mb-2">Adicionar Produto</h2>
            <input
              type="text"
              placeholder="Buscar produto..."
              className="mb-2 p-2 border rounded"
              onChange={e => {/* implementar busca se quiser */}}
            />
            <div className="flex-1 overflow-y-auto mb-2">
              {products.map(prod => (
                <div key={prod.id} className="flex items-center justify-between border-b py-2">
                  <div>
                    <div className="font-bold">{prod.name}</div>
                    <div className="text-xs text-gray-500">R$ {prod.price.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setProductQuantities(q => ({ ...q, [prod.id]: Math.max(0, (q[prod.id] || 0) - 1) }))} className="px-2">-</button>
                    <span>{productQuantities[prod.id] || 0}</span>
                    <button onClick={() => setProductQuantities(q => ({ ...q, [prod.id]: (q[prod.id] || 0) + 1 }))} className="px-2">+</button>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 mt-2"
              onClick={confirmAddProducts}
            >Adicionar produto(s)</button>
            <button className="mt-2 text-gray-500 underline" onClick={() => setShowProductModal(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Modal Adicionar Copo de Açaí */}
      {showAcaiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md flex flex-col">
            <h2 className="text-lg font-bold mb-2">Adicionar Copo de Açaí</h2>
            <div className="mb-2">
              <label className="block font-bold mb-1">Tamanho:</label>
              <div className="flex gap-2">
                {['300ml', '500ml', '1L'].map(size => (
                  <button
                    key={size}
                    className={`px-3 py-1 rounded border ${cupSize === size ? 'bg-purple-600 text-white' : ''}`}
                    onClick={() => setCupSize(size)}
                  >{size}</button>
                ))}
              </div>
            </div>
            <div className="mb-2">
              <label className="block font-bold mb-1">Ingredientes (até 3):</label>
              <div className="flex flex-wrap gap-2">
                {['Banana', 'Granola', 'Leite Condensado', 'Nutella', 'Paçoca', 'Morango'].map(ing => (
                  <button
                    key={ing}
                    className={`px-3 py-1 rounded border ${cupIngredients.includes(ing) ? 'bg-purple-400 text-white' : ''}`}
                    disabled={cupIngredients.length >= 3 && !cupIngredients.includes(ing)}
                    onClick={() => setCupIngredients(cupIngredients.includes(ing)
                      ? cupIngredients.filter(i => i !== ing)
                      : [...cupIngredients, ing])}
                  >{ing}</button>
                ))}
              </div>
            </div>
            <div className="mb-2 font-bold">Preço: R$ {cupSize ? (cupSize === '300ml' ? 12 : cupSize === '500ml' ? 18 : 24) + cupIngredients.length * 2 : 0},00</div>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 mt-2"
              onClick={confirmAddAcaiCup}
              disabled={!cupSize}
            >Adicionar copo</button>
            <button className="mt-2 text-gray-500 underline" onClick={() => setShowAcaiModal(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

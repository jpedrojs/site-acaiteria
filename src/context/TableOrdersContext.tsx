import React, { createContext, useContext, useState } from "react";

// Types
export type ProductOrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type AcaiCupOrderItem = {
  id: string;
  size: string;
  ingredients: string[];
  price: number;
  quantity: number;
};

export type TableOrder = {
  products: ProductOrderItem[];
  acaiCups: AcaiCupOrderItem[];
  observation: string;
};

// Context
const TableOrdersContext = createContext<{
  tableOrders: Record<string, TableOrder>;
  setTableOrder: (tableId: string, order: TableOrder) => void;
} | undefined>(undefined);

export function TableOrdersProvider({ children }: { children: React.ReactNode }) {
  const [tableOrders, setTableOrders] = useState<Record<string, TableOrder>>({});

  function setTableOrder(tableId: string, order: TableOrder) {
    setTableOrders((prev) => ({ ...prev, [tableId]: order }));
  }

  return (
    <TableOrdersContext.Provider value={{ tableOrders, setTableOrder }}>
      {children}
    </TableOrdersContext.Provider>
  );
}

export function useTableOrders() {
  const ctx = useContext(TableOrdersContext);
  if (!ctx) throw new Error("useTableOrders must be used within TableOrdersProvider");
  return ctx;
}

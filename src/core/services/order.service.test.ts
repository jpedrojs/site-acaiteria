import { describe, it, expect, vi, beforeEach } from "vitest";
import { orderService } from "./order.service";

vi.mock("@/core/repositories", () => ({
  orderRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

vi.mock("./notification.service", () => ({
  notificationService: {
    sendOrderStatusNotification: vi.fn().mockResolvedValue(undefined),
    getStatusLabel: vi.fn((s: string) => s),
  },
}));

import { orderRepository } from "@/core/repositories";

describe("OrderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("deve criar pedido com dados válidos", async () => {
      const dto = {
        customer_name: "João",
        customer_phone: "11999999999",
        total: 50,
        items: [
          {
            product_id: "1",
            product_name: "Açaí 500ml",
            quantity: 2,
            unit_price: 18,
            subtotal: 36,
          },
        ],
      };
      const created = { id: "order-1", ...dto, status: "pending" };
      vi.mocked(orderRepository.create).mockResolvedValue(created as any);

      const result = await orderService.create(dto);

      expect(orderRepository.create).toHaveBeenCalledWith(dto);
      expect(result.id).toBe("order-1");
    });

    it("deve lançar erro quando nome do cliente estiver vazio", async () => {
      const dto = {
        customer_name: "  ",
        total: 50,
        items: [{ product_id: "1", product_name: "Açaí", quantity: 1, unit_price: 12, subtotal: 12 }],
      };

      await expect(orderService.create(dto)).rejects.toThrow(
        "Nome do cliente é obrigatório"
      );
      expect(orderRepository.create).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando não houver itens", async () => {
      const dto = {
        customer_name: "João",
        total: 0,
        items: [],
      };

      await expect(orderService.create(dto)).rejects.toThrow(
        "Adicione itens ao pedido"
      );
      expect(orderRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getAll", () => {
    it("deve retornar lista de pedidos", async () => {
      const mockOrders = [
        { id: "1", customer_name: "João", total: 50, order_items: [] },
      ];
      vi.mocked(orderRepository.findAll).mockResolvedValue(mockOrders as any);

      const result = await orderService.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].customer_name).toBe("João");
    });
  });

  describe("getById", () => {
    it("deve retornar pedido quando existir", async () => {
      const mockOrder = { id: "1", customer_name: "Maria", order_items: [] };
      vi.mocked(orderRepository.findById).mockResolvedValue(mockOrder as any);

      const result = await orderService.getById("1");

      expect(orderRepository.findById).toHaveBeenCalledWith("1");
      expect(result?.customer_name).toBe("Maria");
    });

    it("deve retornar null quando pedido não existir", async () => {
      vi.mocked(orderRepository.findById).mockResolvedValue(null);

      const result = await orderService.getById("inexistente");

      expect(result).toBeNull();
    });
  });

  describe("updateStatus", () => {
    it("deve atualizar status do pedido", async () => {
      const updated = { id: "1", status: "preparing", customer_name: "João" };
      vi.mocked(orderRepository.updateStatus).mockResolvedValue(updated as any);

      const result = await orderService.updateStatus({
        id: "1",
        status: "preparing",
      });

      expect(orderRepository.updateStatus).toHaveBeenCalledWith("1", "preparing");
      expect(result.status).toBe("preparing");
    });
  });
});

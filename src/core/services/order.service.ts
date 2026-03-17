/**
 * Service: Lógica de negócio para pedidos.
 * Orquestra repository e notification service.
 */

import { orderRepository } from "@/core/repositories";
import { notificationService } from "./notification.service";
import type {
  OrderDTO,
  OrderWithItemsDTO,
  CreateOrderDTO,
  UpdateOrderStatusDTO,
} from "@/core/dto";

export const orderService = {
  async getAll(): Promise<OrderWithItemsDTO[]> {
    return orderRepository.findAll();
  },

  async getById(id: string): Promise<OrderWithItemsDTO | null> {
    return orderRepository.findById(id);
  },

  async getByCustomerId(customerId: string): Promise<OrderWithItemsDTO[]> {
    return orderRepository.findByCustomerId(customerId);
  },

  async create(dto: CreateOrderDTO): Promise<OrderDTO> {
    if (!dto.customer_name?.trim()) {
      throw new Error("Nome do cliente é obrigatório");
    }
    if (!dto.items?.length) {
      throw new Error("Adicione itens ao pedido");
    }
    return orderRepository.create(dto);
  },

  async updateStatus(dto: UpdateOrderStatusDTO): Promise<OrderDTO> {
    const order = await orderRepository.updateStatus(dto.id, dto.status);

    if (dto.order?.customer_phone) {
      notificationService
        .sendOrderStatusNotification({
          orderId: dto.id,
          customerName: dto.order.customer_name,
          customerPhone: dto.order.customer_phone,
          status: dto.status,
          statusLabel: notificationService.getStatusLabel(dto.status),
          total: dto.order.total,
        })
        .catch(() => {});
    }

    return order;
  },
};

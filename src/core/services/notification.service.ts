/**
 * Service: Notificações (WhatsApp/SMS).
 * Responsável por enviar notificações ao cliente.
 */

import type { OrderStatus } from "@/core/dto";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  preparing: "Preparando",
  ready: "Pronto",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export interface OrderNotificationPayload {
  orderId: string;
  customerName: string;
  customerPhone: string | null;
  status: OrderStatus;
  statusLabel: string;
  total: number;
}

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending: "Seu pedido foi recebido e está na fila! 🍇",
  preparing: "Estamos preparando seu açaí! Em breve estará pronto.",
  ready: "Seu pedido está pronto! Pode retirar ou aguardar a entrega.",
  delivered: "Pedido entregue. Bom apetite! 🎉",
  cancelled: "Seu pedido foi cancelado. Entre em contato conosco se tiver dúvidas.",
};

export const notificationService = {
  async sendOrderStatusNotification(payload: OrderNotificationPayload): Promise<void> {
    const { customerPhone, status, statusLabel } = payload;
    const message = STATUS_MESSAGES[status] || `Status: ${statusLabel}`;

    if (!customerPhone || !customerPhone.replace(/\D/g, "").length) {
      return;
    }

    const enabled = import.meta.env.VITE_ENABLE_NOTIFICATIONS === "true";
    if (!enabled) {
      console.log("[Notifications] Desabilitado. Payload:", { ...payload, message });
      return;
    }

    try {
      // TODO: Integrar com API real (Twilio, WhatsApp Business, etc.)
      console.log("[Notifications] Enviaria para", customerPhone, ":", message);
    } catch (err) {
      console.error("[Notifications] Erro ao enviar:", err);
    }
  },

  getStatusLabel(status: string): string {
    return STATUS_LABELS[status] || status;
  },
};

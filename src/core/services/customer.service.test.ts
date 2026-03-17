import { describe, it, expect, vi, beforeEach } from "vitest";
import { customerService } from "./customer.service";

vi.mock("@/core/repositories", () => ({
  customerRepository: {
    findAll: vi.fn(),
    findByPhone: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { customerRepository } from "@/core/repositories";

describe("CustomerService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    it("deve retornar todos os clientes", async () => {
      const mockCustomers = [
        { id: "1", name: "João", phone: "11999999999" },
      ];
      vi.mocked(customerRepository.findAll).mockResolvedValue(mockCustomers as any);

      const result = await customerService.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("João");
    });
  });

  describe("findByPhone", () => {
    it("deve retornar cliente pelo telefone", async () => {
      const mockCustomer = { id: "1", name: "Maria", phone: "11999999999" };
      vi.mocked(customerRepository.findByPhone).mockResolvedValue(mockCustomer as any);

      const result = await customerService.findByPhone("11999999999");

      expect(customerRepository.findByPhone).toHaveBeenCalledWith("11999999999");
      expect(result?.name).toBe("Maria");
    });

    it("deve retornar null quando não encontrar", async () => {
      vi.mocked(customerRepository.findByPhone).mockResolvedValue(null);

      const result = await customerService.findByPhone("00000000000");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("deve criar cliente com nome válido", async () => {
      const dto = { name: "Pedro", phone: "11988887777" };
      const created = { id: "1", ...dto };
      vi.mocked(customerRepository.create).mockResolvedValue(created as any);

      const result = await customerService.create(dto);

      expect(customerRepository.create).toHaveBeenCalledWith(dto);
      expect(result.name).toBe("Pedro");
    });

    it("deve lançar erro quando nome estiver vazio", async () => {
      await expect(customerService.create({ name: "   " })).rejects.toThrow(
        "Nome é obrigatório"
      );
      expect(customerRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("deve atualizar cliente", async () => {
      const dto = { id: "1", name: "João Silva", phone: "11977776666" };
      vi.mocked(customerRepository.update).mockResolvedValue(dto as any);

      const result = await customerService.update(dto);

      expect(customerRepository.update).toHaveBeenCalledWith(dto);
      expect(result.name).toBe("João Silva");
    });

    it("deve lançar erro quando nome estiver vazio", async () => {
      await expect(
        customerService.update({ id: "1", name: "" })
      ).rejects.toThrow("Nome é obrigatório");
    });
  });

  describe("delete", () => {
    it("deve excluir cliente", async () => {
      vi.mocked(customerRepository.delete).mockResolvedValue(undefined);

      await customerService.delete("1");

      expect(customerRepository.delete).toHaveBeenCalledWith("1");
    });
  });
});

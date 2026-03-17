import { describe, it, expect, vi, beforeEach } from "vitest";
import { productService } from "./product.service";

vi.mock("@/core/repositories", () => ({
  productRepository: {
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { productRepository } from "@/core/repositories";

describe("ProductService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getActiveProducts", () => {
    it("deve retornar produtos ativos", async () => {
      const mockProducts = [
        { id: "1", name: "Açaí 300ml", price: 12, category: "açaí", active: true },
      ];
      vi.mocked(productRepository.findAll).mockResolvedValue(mockProducts as any);

      const result = await productService.getActiveProducts();

      expect(productRepository.findAll).toHaveBeenCalledWith(true);
      expect(result).toEqual(mockProducts);
    });
  });

  describe("getAllProducts", () => {
    it("deve retornar todos os produtos", async () => {
      const mockProducts = [
        { id: "1", name: "Açaí 300ml", active: true },
        { id: "2", name: "Açaí 500ml", active: false },
      ];
      vi.mocked(productRepository.findAll).mockResolvedValue(mockProducts as any);

      const result = await productService.getAllProducts();

      expect(productRepository.findAll).toHaveBeenCalledWith(false);
      expect(result).toHaveLength(2);
    });
  });

  describe("create", () => {
    it("deve criar produto com valores padrão", async () => {
      const dto = { name: "Açaí 700ml", price: 24 };
      const created = { id: "1", ...dto, category: "açaí", active: true };
      vi.mocked(productRepository.create).mockResolvedValue(created as any);

      const result = await productService.create(dto);

      expect(productRepository.create).toHaveBeenCalledWith({
        ...dto,
        category: "açaí",
        active: true,
      });
      expect(result).toEqual(created);
    });
  });

  describe("update", () => {
    it("deve atualizar produto", async () => {
      const dto = { id: "1", name: "Açaí 300ml", price: 15 };
      vi.mocked(productRepository.update).mockResolvedValue(dto as any);

      const result = await productService.update(dto);

      expect(productRepository.update).toHaveBeenCalledWith(dto);
      expect(result).toEqual(dto);
    });
  });

  describe("delete", () => {
    it("deve excluir produto", async () => {
      vi.mocked(productRepository.delete).mockResolvedValue(undefined);

      await productService.delete("1");

      expect(productRepository.delete).toHaveBeenCalledWith("1");
    });
  });
});

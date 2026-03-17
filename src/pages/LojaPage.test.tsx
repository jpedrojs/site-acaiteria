import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import LojaPage from "./LojaPage";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <LojaPage />
    </MemoryRouter>
  );
}

describe("LojaPage", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("deve exibir título e descrição", () => {
    renderWithRouter();
    expect(screen.getByText(/Açaí Flow/)).toBeInTheDocument();
    expect(screen.getByText(/Pedir online/)).toBeInTheDocument();
  });

  it("deve ter botão Pedir online que navega para /pedir", () => {
    renderWithRouter();
    const pedirBtn = screen.getByRole("link", { name: /Pedir online/i });
    expect(pedirBtn).toHaveAttribute("href", "/pedir");
  });

  it("deve ter botão Cadastrar-se que navega para /cadastro", () => {
    renderWithRouter();
    const cadastroBtn = screen.getByRole("link", { name: /Cadastrar-se/i });
    expect(cadastroBtn).toHaveAttribute("href", "/cadastro");
  });

  it("deve ter formulário de acompanhar pedido", () => {
    renderWithRouter();
    expect(screen.getByPlaceholderText(/abc123/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Buscar pedido/ })).toBeInTheDocument();
  });

  it("deve navegar para /pedido/:id ao submeter código do pedido", () => {
    renderWithRouter();
    const input = screen.getByPlaceholderText(/abc123/);
    const form = input.closest("form");
    fireEvent.change(input, { target: { value: "order-123" } });
    fireEvent.submit(form!);
    expect(mockNavigate).toHaveBeenCalledWith("/pedido/order-123");
  });
});

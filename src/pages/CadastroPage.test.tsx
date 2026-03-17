import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CadastroPage from "./CadastroPage";

const mockNavigate = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/core/controllers", () => ({
  useCreateCustomer: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

const queryClient = new QueryClient();

function renderWithProviders() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CadastroPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("CadastroPage", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockMutateAsync.mockClear();
  });

  it("deve exibir formulário de cadastro", () => {
    renderWithProviders();
    expect(screen.getByLabelText(/Nome \*/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Telefone/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Endereço/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cadastrar/ })).toBeInTheDocument();
  });

  it("deve ter link para voltar", () => {
    renderWithProviders();
    const voltar = screen.getByText(/Voltar/);
    expect(voltar.closest("a")).toHaveAttribute("href", "/loja");
  });

  it("deve submeter formulário com dados preenchidos", async () => {
    mockMutateAsync.mockResolvedValue({ id: "1", name: "João" });
    renderWithProviders();

    fireEvent.change(screen.getByLabelText(/Nome \*/), {
      target: { value: "João Silva" },
    });
    fireEvent.change(screen.getByLabelText(/Telefone/), {
      target: { value: "11999999999" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/ }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: "João Silva",
        phone: "11999999999",
        email: undefined,
        address: undefined,
      });
    });
  });
});

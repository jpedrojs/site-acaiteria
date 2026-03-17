# Testes - Açaí Flow

## Estrutura de testes

Os testes estão organizados por camada:

```
src/
├── core/
│   └── services/
│       ├── product.service.test.ts
│       ├── customer.service.test.ts
│       └── order.service.test.ts
└── pages/
    ├── LojaPage.test.tsx
    └── CadastroPage.test.tsx
```

## O que é testado

### Services (lógica de negócio)

- **product.service.test.ts**: CRUD de produtos, getActiveProducts, getAllProducts
- **customer.service.test.ts**: CRUD de clientes, findByPhone, validações (nome obrigatório)
- **order.service.test.ts**: create (com validações), getAll, getById, updateStatus

### Pages (fluxo do cliente)

- **LojaPage.test.tsx**: Landing, botões Pedir online e Cadastrar-se, formulário de acompanhar pedido
- **CadastroPage.test.tsx**: Formulário de cadastro, submissão com dados

## Executar testes

```bash
npm run test
```

Ou com watch mode:

```bash
npm run test:watch
```

## Mocks

Os testes de service usam `vi.mock` para mockar os repositories, evitando chamadas reais ao Supabase. Os testes de página mockam os controllers (hooks).

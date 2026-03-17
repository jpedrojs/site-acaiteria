import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Users, ClipboardList, Store, Package, UserPlus } from "lucide-react";

const navItems = [
  { to: "/", label: "Novo Pedido", icon: ShoppingCart },
  { to: "/pedidos", label: "Pedidos", icon: ClipboardList },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/produtos", label: "Produtos", icon: Package },
];

const isPublicRoute = (path: string) =>
  path === "/loja" || path === "/pedir" || path === "/cadastro" || path.startsWith("/pedido/");

export default function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const publicView = isPublicRoute(location.pathname);
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <header className="border-b bg-card">
      <div className="flex items-center h-14 px-4 gap-6">
        <Link to={publicView ? "/loja" : "/"} className="font-display text-xl font-bold text-primary mr-4 hover:opacity-90">
          🍇 Açaí Flow
        </Link>
        {publicView ? (
          <nav className="flex gap-1">
            <Link
              to="/loja"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-100 ${
                location.pathname === "/loja"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Início
            </Link>
            <Link
              to="/pedir"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-100 ${
                location.pathname === "/pedir"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Store className="h-4 w-4" />
              Pedir online
            </Link>
            <Link
              to="/cadastro"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-100 ${
                location.pathname === "/cadastro"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <UserPlus className="h-4 w-4" />
              Cadastrar-se
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-100"
            >
              Painel interno
            </Link>
          </nav>
        ) : (
          <nav className="flex gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-100 ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-100"
              onClick={() => {
                if (window.confirm("Sair do painel interno e ir para a loja? Isso irá deslogar o usuário.")) {
                  localStorage.removeItem("isLoggedIn");
                  navigate("/loja");
                }
              }}
            >
              <Store className="h-4 w-4" />
              Loja
            </button>
          </nav>
        )}
      </div>
      {/* Banner de identificação do painel interno */}
      {!publicView && isLoggedIn && (
        <div className="w-full bg-green-600 text-white text-center py-1 text-xs font-bold tracking-wider">
          PAINEL INTERNO — Operador logado
        </div>
      )}
    </header>
  );
}

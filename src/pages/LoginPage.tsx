import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simples auth fake para demo
    if (username === "admin" && password === "1234") {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/painel");
    } else {
      setError("Usuário ou senha inválidos");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <form onSubmit={handleLogin} className="bg-card p-8 rounded-xl shadow-md w-full max-w-xs space-y-4">
        <h2 className="font-display text-xl font-bold mb-2">Login</h2>
        <Input
          placeholder="Usuário"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <Input
          placeholder="Senha"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button type="submit" className="w-full bg-primary text-primary-foreground">Entrar</Button>
      </form>
    </div>
  );
}

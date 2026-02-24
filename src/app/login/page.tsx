"use client";
import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) setErro("Credenciais inválidas.");
    else router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-16 rounded-[60px] shadow-2xl border border-gray-100 w-full max-w-xl">
        <h1 className="text-5xl font-black text-indigo-950 mb-6 text-center tracking-tight">
          Acesso Clínico
        </h1>
        <p className="text-gray-500 text-center font-bold text-xl mb-12">
          Olá, Pedro. Faça login para gerenciar seus pacientes.
        </p>

        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label className="block text-indigo-950 font-black text-xs uppercase tracking-widest mb-4 px-2">
              E-mail Profissional
            </label>
            <input
              type="email"
              // Adicionado 'text-gray-900' e 'placeholder-gray-300' para contraste
              className="w-full p-6 rounded-3xl bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-2xl text-gray-900 placeholder-gray-300"
              placeholder="pedro@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-indigo-950 font-black text-xs uppercase tracking-widest mb-4 px-2">
              Senha
            </label>
            <input
              type="password"
              className="w-full p-6 rounded-3xl bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-2xl text-gray-900 placeholder-gray-300"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {erro && (
            <p className="text-red-600 font-black text-center text-sm bg-red-50 p-4 rounded-2xl">
              {erro}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-7 rounded-3xl font-black text-xl uppercase shadow-lg hover:bg-indigo-700 transition-all active:scale-95 tracking-widest"
          >
            Entrar no Painel
          </button>
        </form>
      </div>
    </div>
  );
}

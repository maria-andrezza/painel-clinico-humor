"use client";
import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function RegistroHumor() {
  const [nome, setNome] = useState("");
  const [humor, setHumor] = useState(0);
  const [periodo, setPeriodo] = useState("Manhã");
  const [eventos, setEventos] = useState("");
  const [pensamentos, setPensamentos] = useState("");

  // Lógica de Feedback Visual e Textual para o Paciente
  const getFeedbackHumor = (nivel: number) => {
    if (nivel >= 4)
      return { texto: "Energia Muito Alta / Agitação", cor: "text-green-600" };
    if (nivel >= 1)
      return { texto: "Energia Levemente Alta", cor: "text-green-500" };
    if (nivel === 0)
      return { texto: "Equilíbrio (Eutimia)", cor: "text-indigo-600" };
    if (nivel >= -2)
      return { texto: "Energia Levemente Baixa", cor: "text-red-400" };
    return { texto: "Energia Muito Baixa / Desânimo", cor: "text-red-600" };
  };

  const feedback = getFeedbackHumor(humor);

  const registrar = async () => {
    if (!nome) {
      alert("Por favor, digite seu nome completo.");
      return;
    }

    const { error } = await supabase.from("registros_humor").insert([
      {
        paciente_nome: nome,
        nivel_humor: humor,
        turno: periodo,
        eventos_relevantes: eventos,
        pensamentos_relevantes: pensamentos,
      },
    ]);

    if (error) {
      alert("Erro ao salvar o registro.");
    } else {
      alert("Sucesso! O Pedro já recebeu seu registro.");
      // Limpa os campos após o envio, exceto o nome para facilitar o próximo envio
      setEventos("");
      setPensamentos("");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center pb-20 font-sans">
      {/* Cabeçalho Profissional */}
      <div className="w-full bg-indigo-600 py-12 px-8 rounded-b-[45px] text-white max-w-2xl shadow-xl mb-10 text-center">
        <h1 className="text-4xl font-black mb-4 tracking-tight">
          Monitoramento Diário
        </h1>
        <p className="text-xl opacity-90 font-medium">
          Como está sua "bateria interna" agora?
        </p>
      </div>

      <div className="w-full max-w-xl p-4 space-y-10">
        {/* Identificação do Paciente */}
        <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-50">
          <label className="block font-bold mb-4 text-gray-800 text-xl text-center">
            Seu Nome completo
          </label>
          <input
            type="text"
            placeholder="Ex: João da Silva"
            className="w-full bg-gray-50 border-2 border-gray-100 p-5 rounded-2xl text-gray-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </section>

        {/* Nível de Energia (Substitui o "Alteração Detectada" por algo mais humano) */}
        <section className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-50 text-center">
          <h2 className="font-bold text-gray-800 text-xl mb-8 flex items-center justify-center gap-2">
            <span>🔋</span> Nível de Energia
          </h2>

          <div className="mb-8">
            <span
              className={`text-7xl font-black tracking-tighter transition-colors ${feedback.cor}`}
            >
              {humor > 0 ? `+${humor}` : humor}
            </span>
            <p
              className={`font-black text-xl mt-2 transition-colors ${feedback.cor}`}
            >
              {feedback.texto}
            </p>
          </div>

          <input
            type="range"
            min="-5"
            max="5"
            step="1"
            value={humor}
            className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-6 accent-indigo-600"
            onChange={(e) => setHumor(Number(e.target.value))}
          />

          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span>Baixa</span>
            <span>Equilíbrio</span>
            <span>Alta</span>
          </div>
        </section>

        {/* Turno do Dia */}
        <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-50 text-center">
          <h3 className="font-bold text-gray-800 mb-6 text-xl text-center">
            Período do Registro
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {["Manhã", "Tarde", "Noite"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`py-5 rounded-2xl font-bold border-2 transition-all ${
                  periodo === p
                    ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm"
                    : "border-gray-50 text-gray-400 hover:border-indigo-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </section>

        {/* Seção Clínica (Cópia fiel do modelo de papel) */}
        <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-50 space-y-8">
          <div>
            <label className="block font-bold mb-4 text-gray-800 text-xl text-center">
              📢 Eventos Relevantes
            </label>
            <textarea
              value={eventos}
              placeholder="Ocorreu algo fora do comum? (Ex: Discussão, conquista, perda de sono...)"
              className="w-full bg-gray-50 border-2 border-gray-100 p-5 rounded-2xl text-gray-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none shadow-inner transition-all"
              onChange={(e) => setEventos(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-bold mb-4 text-gray-800 text-xl text-center">
              🧠 Pensamentos Relevantes
            </label>
            <textarea
              value={pensamentos}
              placeholder="O que passou pela sua cabeça? (Ex: Senti que não sou capaz, ideias aceleradas...)"
              className="w-full bg-gray-50 border-2 border-gray-100 p-5 rounded-2xl text-gray-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none shadow-inner transition-all"
              onChange={(e) => setPensamentos(e.target.value)}
            />
          </div>
        </section>

        {/* Botão de Envio */}
        <div className="pt-6">
          <button
            onClick={registrar}
            className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black text-2xl shadow-2xl hover:bg-indigo-700 active:scale-[0.98] transition-all uppercase tracking-tight"
          >
            Enviar para o Pedro
          </button>
        </div>
      </div>
    </main>
  );
}

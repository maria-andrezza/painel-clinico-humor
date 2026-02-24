"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function PainelAnalise() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pacienteSelecionado, setPacienteSelecionado] = useState("");
  const [periodoFiltro, setPeriodoFiltro] = useState("30 Dias");
  const [turnoFiltro, setTurnoFiltro] = useState("Todos"); // Novo Filtro do Pedro
  const [menuAberto, setMenuAberto] = useState(false);

  const [novaSenha, setNovaSenha] = useState("");
  const [statusSenha, setStatusSenha] = useState("");

  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleTrocarSenha = async () => {
    if (novaSenha.length < 6) {
      setStatusSenha("Mínimo 6 caracteres.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) setStatusSenha("Erro: " + error.message);
    else {
      setStatusSenha("Senha alterada! 🔒");
      setNovaSenha("");
    }
  };

  useEffect(() => {
    const inicializarPainel = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("registros_humor")
        .select("*")
        .order("criado_em", { ascending: true });

      if (!error && data) {
        const formatados = data.map((reg) => ({
          ...reg,
          dataObjeto: new Date(reg.criado_em),
          dataSimples: new Date(reg.criado_em).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          }),
          dataCompleta: new Date(reg.criado_em).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          humor: reg.nivel_humor,
          turno: reg.turno || "Não Informado",
        }));
        setRegistros(formatados);
        const nomesUnicos = Array.from(
          new Set(data.map((reg: any) => reg.paciente_nome)),
        ).filter(Boolean) as string[];
        setPacientes(nomesUnicos);
        if (nomesUnicos.length > 0 && !pacienteSelecionado)
          setPacienteSelecionado(nomesUnicos[0]);
      }
      setLoading(false);
    };
    inicializarPainel();
  }, [router]);

  // LÓGICA DE FILTRAGEM COMBINADA (Paciente + Período + Turno)
  const dadosFiltrados = registros.filter((r) => {
    // 1. Primeiro, filtra pelo paciente selecionado
    if (r.paciente_nome !== pacienteSelecionado) return false;

    // 2. Depois, aplica o filtro de turno se não for "Todos"
    if (turnoFiltro !== "Todos" && r.turno !== turnoFiltro) return false;

    // 3. Por fim, aplica o filtro de tempo
    const hoje = new Date();
    const dataLimite = new Date();
    if (periodoFiltro === "7 Dias") dataLimite.setDate(hoje.getDate() - 7);
    else if (periodoFiltro === "30 Dias")
      dataLimite.setDate(hoje.getDate() - 30);
    else if (periodoFiltro === "6 Meses")
      dataLimite.setMonth(hoje.getMonth() - 6);
    else if (periodoFiltro === "1 Ano")
      dataLimite.setFullYear(hoje.getFullYear() - 1);

    return r.dataObjeto >= dataLimite;
  });

  const getStatus = (nivel: number) => {
    if (nivel <= -3)
      return {
        label: "Depressão Grave",
        color: "text-red-700",
        bg: "bg-red-100",
      };
    if (nivel < 0)
      return { label: "Depressão", color: "text-red-500", bg: "bg-red-50" };
    if (nivel >= 3)
      return { label: "Mania", color: "text-green-700", bg: "bg-green-100" };
    if (nivel > 0)
      return { label: "Hipomania", color: "text-green-500", bg: "bg-green-50" };
    return { label: "Eutimia", color: "text-indigo-600", bg: "bg-indigo-50" };
  };

  const mediaHumor =
    dadosFiltrados.length > 0
      ? (
          dadosFiltrados.reduce((acc, curr) => acc + curr.humor, 0) /
          dadosFiltrados.length
        ).toFixed(1)
      : 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 font-sans text-gray-900">
      <button
        onClick={() => setMenuAberto(!menuAberto)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-indigo-600 text-white p-5 rounded-full shadow-2xl font-black text-xs uppercase tracking-widest"
      >
        {menuAberto ? "FECHAR" : "PACIENTES"}
      </button>

      <aside
        className={`fixed lg:static inset-0 z-40 bg-white border-r border-gray-100 p-8 flex flex-col justify-between transition-transform duration-300 ${menuAberto ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} w-full lg:w-80 h-full`}
      >
        <div className="flex flex-col gap-6">
          <h2 className="font-bold text-gray-400 text-sm uppercase tracking-widest">
            Pacientes
          </h2>
          <div className="space-y-3 overflow-y-auto max-h-[40vh]">
            {pacientes.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPacienteSelecionado(p);
                  setMenuAberto(false);
                }}
                className={`flex items-center gap-4 w-full p-4 rounded-2xl font-bold transition-all ${pacienteSelecionado === p ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:bg-gray-50"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black ${pacienteSelecionado === p ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
                >
                  {p[0]}
                </div>
                <span className="truncate">{p}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">
              Sua Privacidade
            </p>
            <input
              type="password"
              placeholder="Nova senha"
              className="w-full p-3 rounded-xl border-2 border-white focus:border-indigo-600 outline-none text-xs font-bold mb-2 shadow-sm"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
            <button
              onClick={handleTrocarSenha}
              className="w-full p-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-tighter hover:bg-indigo-700"
            >
              Atualizar Senha
            </button>
            {statusSenha && (
              <p className="text-[9px] font-black text-indigo-600 mt-2 text-center uppercase">
                {statusSenha}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full p-5 rounded-2xl font-black text-red-500 bg-red-50 hover:bg-red-100 transition-all uppercase text-xs tracking-widest mt-10"
        >
          Sair do Painel
        </button>
      </aside>

      <main className="flex-1 p-6 lg:p-12 overflow-x-hidden">
        <header className="mb-12 flex flex-col gap-8 lg:flex-row lg:justify-between lg:items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black text-indigo-950 tracking-tight">
              Análise Clínica
            </h1>
            <p className="text-gray-500 font-medium text-lg lg:text-xl mt-2">
              Tendências de {pacienteSelecionado}
            </p>
          </div>
          <div className="flex flex-col gap-4 w-full lg:w-auto items-stretch lg:items-end">
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  window.location.origin + "/registro",
                );
                alert("Link copiado!");
              }}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase shadow-lg active:scale-95"
            >
              🔗 COPIAR LINK DO FORMULÁRIO
            </button>

            {/* SELEÇÃO DE TURNO */}
            <div className="flex bg-gray-200/50 p-1.5 rounded-2xl border border-gray-200 gap-1">
              {["Todos", "Manhã", "Tarde", "Noite"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTurnoFiltro(t)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${turnoFiltro === t ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:text-indigo-600"}`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:flex bg-gray-200/50 p-1.5 rounded-2xl border border-gray-200 gap-1">
              {["7 Dias", "30 Dias", "6 Meses", "1 Ano"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setPeriodoFiltro(tab)}
                  className={`px-4 py-3 rounded-xl text-xs font-black transition-all ${periodoFiltro === tab ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-gray-400 text-xs font-black uppercase mb-3">
                Média do Período
              </p>
              <div className="flex items-center gap-4">
                <h4 className="text-5xl font-black text-indigo-900">
                  {mediaHumor}
                </h4>
                <span
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${getStatus(Number(mediaHumor)).bg} ${getStatus(Number(mediaHumor)).color}`}
                >
                  {getStatus(Number(mediaHumor)).label}
                </span>
              </div>
            </div>
            <p className="mt-6 text-[11px] text-gray-400 font-bold border-t border-gray-50 pt-4 italic">
              Média para o turno e período selecionados.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-gray-400 text-xs font-black uppercase mb-3">
                Registros
              </p>
              <h4 className="text-5xl font-black text-indigo-900">
                {dadosFiltrados.length}
              </h4>
            </div>
            <p className="mt-6 text-[11px] text-gray-400 font-bold border-t border-gray-50 pt-4 italic">
              Total de envios detectados nos filtros atuais.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-gray-400 text-xs font-black uppercase mb-3">
                Amplitude
              </p>
              <h4 className="text-5xl font-black text-orange-600">
                {dadosFiltrados.length > 0
                  ? Math.max(...dadosFiltrados.map((d) => d.humor)) -
                    Math.min(...dadosFiltrados.map((d) => d.humor))
                  : 0}
              </h4>
            </div>
            <p className="mt-6 text-[11px] text-gray-400 font-bold border-t border-gray-50 pt-4 italic">
              Oscilação emocional registrada.
            </p>
          </div>
        </div>

        {/* Gráfico */}
        <div className="bg-white p-6 lg:p-12 rounded-[40px] shadow-sm border border-gray-100 mb-12">
          <h3 className="font-black text-indigo-950 text-2xl mb-8">
            📊 Evolução de Humor
          </h3>
          <div className="w-full h-[350px] lg:h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dadosFiltrados}
                margin={{ left: -15, right: 15, top: 10, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="dataSimples"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontWeight: 700, fontSize: 10 }}
                  dy={10}
                />
                <YAxis
                  domain={[-5, 5]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontWeight: 700, fontSize: 10 }}
                />
                <Tooltip />
                <ReferenceLine y={0} stroke="#e5e7eb" strokeWidth={3} />
                <Line
                  type="monotone"
                  dataKey="humor"
                  stroke="#4f46e5"
                  strokeWidth={6}
                  dot={{
                    r: 4,
                    fill: "#4f46e5",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detalhamento com Notas Clínicas */}
        <div className="bg-white p-6 lg:p-12 rounded-[40px] shadow-sm border border-gray-100 mb-20">
          <h3 className="font-black text-indigo-950 text-2xl mb-8">
            Detalhamento
          </h3>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase border-b border-gray-100 font-black">
                  <th className="pb-6 pr-4">Data/Hora e Notas</th>
                  <th className="pb-6 text-center px-4">Turno</th>
                  <th className="pb-6 text-right pl-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dadosFiltrados
                  .slice()
                  .reverse()
                  .map((reg, index) => {
                    const s = getStatus(reg.nivel_humor);
                    return (
                      <tr
                        key={index}
                        className="hover:bg-gray-50/50 transition-all"
                      >
                        <td className="py-8 align-top">
                          <div className="font-bold text-gray-700 text-sm lg:text-lg mb-4">
                            {reg.dataCompleta}
                          </div>
                          {(reg.eventos_relevantes ||
                            reg.pensamentos_relevantes) && (
                            <div className="flex flex-col gap-3 max-w-lg">
                              {reg.eventos_relevantes && (
                                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                                  <p className="text-[10px] font-black text-amber-700 uppercase mb-1">
                                    📢 Evento Relevante
                                  </p>
                                  <p className="text-xs text-amber-900 font-medium leading-relaxed">
                                    {reg.eventos_relevantes}
                                  </p>
                                </div>
                              )}
                              {reg.pensamentos_relevantes && (
                                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                                  <p className="text-[10px] font-black text-indigo-700 uppercase mb-1">
                                    🧠 Pensamento Relevante
                                  </p>
                                  <p className="text-xs text-indigo-900 font-medium leading-relaxed">
                                    {reg.pensamentos_relevantes}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-8 text-center align-top">
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                            {reg.turno}
                          </span>
                        </td>
                        <td className="py-8 text-right align-top">
                          <span
                            className={`inline-block px-4 py-2 rounded-xl font-black text-[10px] uppercase ${s.bg} ${s.color}`}
                          >
                            {s.label} (
                            {reg.humor > 0 ? `+${reg.humor}` : reg.humor})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

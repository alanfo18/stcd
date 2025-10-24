import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: agendamentos = [] } = trpc.agendamento.list.useQuery();
  const { data: pagamentos = [] } = trpc.pagamento.list.useQuery();
  const { data: diaristas = [] } = trpc.diarista.list.useQuery();

  // Calcular métricas
  const hoje = new Date();
  const proximosSete = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);

  const agendamentosPendentes = agendamentos.filter(
    (a) => new Date(a.dataInicio) >= hoje && new Date(a.dataInicio) <= proximosSete && a.status === "agendado"
  ).length;

  const pagamentosAtraso = pagamentos.filter((p) => p.status === "pendente").length;

  const receitaMes = pagamentos
    .filter((p) => {
      const dataPagamento = new Date(p.dataPagamento || p.createdAt);
      return dataPagamento.getMonth() === hoje.getMonth() && dataPagamento.getFullYear() === hoje.getFullYear();
    })
    .reduce((acc, p) => acc + (p.valor || 0), 0);

  const agendamentosConcluidosMes = agendamentos.filter((a) => {
    const dataInicio = new Date(a.dataInicio);
    return a.status === "concluido" && dataInicio.getMonth() === hoje.getMonth() && dataInicio.getFullYear() === hoje.getFullYear();
  }).length;

  const totalAgendamentosMes = agendamentos.filter((a) => {
    const dataInicio = new Date(a.dataInicio);
    return dataInicio.getMonth() === hoje.getMonth() && dataInicio.getFullYear() === hoje.getFullYear();
  }).length;

  const taxaConclusao = totalAgendamentosMes > 0 ? Math.round((agendamentosConcluidosMes / totalAgendamentosMes) * 100) : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitoramento geral do sistema</p>
          </div>
          <Button onClick={() => setLocation("/")} variant="outline" className="mr-2">
            ← Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card: Agendamentos Pendentes */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900">📅 Próximos 7 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{agendamentosPendentes}</div>
              <p className="text-xs text-blue-700 mt-1">Agendamentos pendentes</p>
            </CardContent>
          </Card>

          {/* Card: Pagamentos em Atraso */}
          <Card className="bg-red-50 border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-900">⏰ Em Atraso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{pagamentosAtraso}</div>
              <p className="text-xs text-red-700 mt-1">Pagamentos pendentes</p>
            </CardContent>
          </Card>

          {/* Card: Receita do Mês */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-900">💰 Receita do Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(receitaMes)}</div>
              <p className="text-xs text-green-700 mt-1">Total pago</p>
            </CardContent>
          </Card>

          {/* Card: Taxa de Conclusão */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-900">✅ Taxa de Conclusão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{taxaConclusao}%</div>
              <p className="text-xs text-purple-700 mt-1">Agendamentos concluídos</p>
            </CardContent>
          </Card>
        </div>

        {/* Seção: Resumo de Atividades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card: Diaristas Ativas */}
          <Card>
            <CardHeader>
              <CardTitle>👩‍💼 Diaristas Ativas</CardTitle>
              <CardDescription>Total de diaristas cadastradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">{diaristas.length}</div>
              <p className="text-sm text-gray-600 mt-2">Prontas para agendamentos</p>
            </CardContent>
          </Card>

          {/* Card: Resumo do Mês */}
          <Card>
            <CardHeader>
              <CardTitle>📈 Resumo do Mês</CardTitle>
              <CardDescription>Estatísticas gerais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Agendamentos:</span>
                <span className="font-semibold">{totalAgendamentosMes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Concluídos:</span>
                <span className="font-semibold text-green-600">{agendamentosConcluidosMes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pagamentos:</span>
                <span className="font-semibold">{pagamentos.filter((p) => p.status === "pago").length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção: Ações Rápidas */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>⚡ Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3 flex-wrap">
            <Button onClick={() => setLocation("/diaristas")} className="bg-blue-600 hover:bg-blue-700">
              ➕ Adicionar Diarista
            </Button>
            <Button onClick={() => setLocation("/agendamentos")} className="bg-green-600 hover:bg-green-700">
              📅 Novo Agendamento
            </Button>
            <Button onClick={() => setLocation("/pagamentos")} className="bg-purple-600 hover:bg-purple-700">
              💳 Registrar Pagamento
            </Button>
            <Button onClick={() => setLocation("/relatorios")} variant="outline">
              📊 Ver Relatórios
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


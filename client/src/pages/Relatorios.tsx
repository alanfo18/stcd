import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Relatorios() {
  const [, setLocation] = useLocation();
  
  const { data: diaristas = [] } = trpc.diarista.list.useQuery();
  const { data: agendamentos = [] } = trpc.agendamento.list.useQuery();
  const { data: pagamentos = [] } = trpc.pagamento.list.useQuery();

  const totalDiaristas = diaristas.length;
  const totalAgendamentos = agendamentos.length;
  const agendamentosConc = agendamentos.filter(a => a.status === "concluido").length;
  const totalPagamentos = pagamentos.reduce((sum, p) => sum + p.valor, 0);
  const pagamentosPagos = pagamentos.filter(p => p.status === "pago").reduce((sum, p) => sum + p.valor, 0);
  const pagamentosPendentes = pagamentos.filter(p => p.status === "pendente").reduce((sum, p) => sum + p.valor, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600 mt-1">Visualize estatísticas e resumos do sistema</p>
          </div>
          <Button onClick={() => setLocation("/")} variant="outline" className="mr-2">
            ← Voltar
          </Button>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Diaristas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{totalDiaristas}</p>
              <p className="text-xs text-gray-500 mt-1">Cadastradas no sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{totalAgendamentos}</p>
              <p className="text-xs text-gray-500 mt-1">{agendamentosConc} concluídos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{formatCurrency(pagamentosPagos)}</p>
              <p className="text-xs text-gray-500 mt-1">Pagamentos confirmados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{formatCurrency(pagamentosPendentes)}</p>
              <p className="text-xs text-gray-500 mt-1">Aguardando pagamento</p>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Detalhado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Agendamentos</CardTitle>
              <CardDescription>Status dos agendamentos realizados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Agendados</span>
                <span className="text-2xl font-bold text-blue-600">
                  {agendamentos.filter(a => a.status === "agendado").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Concluídos</span>
                <span className="text-2xl font-bold text-green-600">
                  {agendamentos.filter(a => a.status === "concluido").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cancelados</span>
                <span className="text-2xl font-bold text-red-600">
                  {agendamentos.filter(a => a.status === "cancelado").length}
                </span>
              </div>
              <div className="border-t pt-4 flex justify-between items-center font-semibold">
                <span>Total</span>
                <span className="text-2xl">{totalAgendamentos}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo de Pagamentos</CardTitle>
              <CardDescription>Status dos pagamentos registrados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pagos</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(pagamentosPagos)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pendentes</span>
                <span className="text-lg font-bold text-orange-600">{formatCurrency(pagamentosPendentes)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cancelados</span>
                <span className="text-lg font-bold text-red-600">
                  {formatCurrency(pagamentos.filter(p => p.status === "cancelado").reduce((sum, p) => sum + p.valor, 0))}
                </span>
              </div>
              <div className="border-t pt-4 flex justify-between items-center font-semibold">
                <span>Total</span>
                <span className="text-lg">{formatCurrency(totalPagamentos)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métodos de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Método de Pagamento</CardTitle>
            <CardDescription>Pagamentos registrados por método</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["dinheiro", "pix", "transferencia", "cartao"].map((metodo) => {
                const total = pagamentos
                  .filter(p => p.metodo === metodo)
                  .reduce((sum, p) => sum + p.valor, 0);
                const count = pagamentos.filter(p => p.metodo === metodo).length;
                const percentage = totalPagamentos > 0 ? (total / totalPagamentos) * 100 : 0;

                const labels: Record<string, string> = {
                  dinheiro: "💵 Dinheiro",
                  pix: "📱 PIX",
                  transferencia: "🏦 Transferência",
                  cartao: "💳 Cartão",
                };

                return (
                  <div key={metodo}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">{labels[metodo]}</span>
                      <span className="font-semibold">{count} transações</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-sm text-gray-600 mt-1">
                      {formatCurrency(total)} ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


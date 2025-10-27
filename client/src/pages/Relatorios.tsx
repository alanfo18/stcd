import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Relatorios() {
  const [, setLocation] = useLocation();
  const [filtroTipo, setFiltroTipo] = useState<"diarista" | "data" | "operacao">("diarista");
  const [diaristaId, setDiaristaId] = useState<string>("");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [operacao, setOperacao] = useState<string>("");

  const { data: diaristas = [] } = trpc.diarista.list.useQuery();
  const { data: agendamentos = [] } = trpc.agendamento.list.useQuery();
  const { data: pagamentos = [] } = trpc.pagamento.list.useQuery();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  // Filtrar agendamentos por diarista
  const agendamentosPorDiarista = useMemo(() => {
    if (!diaristaId) return [];
    return agendamentos.filter((a) => a.diaristaId === parseInt(diaristaId));
  }, [agendamentos, diaristaId]);

  // Filtrar pagamentos por diarista
  const pagamentosPorDiarista = useMemo(() => {
    if (!diaristaId) return [];
    const agendamentosIds = agendamentosPorDiarista.map((a) => a.id);
    return pagamentos.filter((p) => agendamentosIds.includes(p.agendamentoId));
  }, [pagamentos, agendamentosPorDiarista]);

  // Filtrar agendamentos por data
  const agendamentosPorData = useMemo(() => {
    if (!dataInicio || !dataFim) return [];
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    return agendamentos.filter((a) => {
      const data = new Date(a.dataInicio);
      return data >= inicio && data <= fim;
    });
  }, [agendamentos, dataInicio, dataFim]);

  // Filtrar pagamentos por data
  const pagamentosPorData = useMemo(() => {
    if (!dataInicio || !dataFim) return [];
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    return pagamentos.filter((p) => {
      const data = new Date(p.dataPagamento || p.createdAt);
      return data >= inicio && data <= fim;
    });
  }, [pagamentos, dataInicio, dataFim]);

  // Filtrar agendamentos por operação
  const agendamentosPorOperacao = useMemo(() => {
    if (!operacao) return [];
    return agendamentos.filter((a) => a.enderecoServico === operacao);
  }, [agendamentos, operacao]);

  // Filtrar pagamentos por operação
  const pagamentosPorOperacao = useMemo(() => {
    if (!operacao) return [];
    const agendamentosIds = agendamentosPorOperacao.map((a) => a.id);
    return pagamentos.filter((p) => agendamentosIds.includes(p.agendamentoId));
  }, [pagamentos, agendamentosPorOperacao]);

  // Calcular totais
  const calcularTotais = (pagtos: any[]) => {
    return pagtos.reduce((acc, p) => acc + (p.valor || 0), 0);
  };

  // Operações únicas
  const operacoes = useMemo(() => {
    return Array.from(new Set(agendamentos.map((a) => a.enderecoServico)));
  }, [agendamentos]);

  const renderRelatorioAgendamentos = (agendamentos: any[], pagamentos: any[]) => {
    if (agendamentos.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Nenhum agendamento encontrado</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos ({agendamentos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Diarista</th>
                    <th className="text-left py-2 px-2">Especialidade</th>
                    <th className="text-left py-2 px-2">Local</th>
                    <th className="text-left py-2 px-2">Data Início</th>
                    <th className="text-left py-2 px-2">Data Fim</th>
                    <th className="text-right py-2 px-2">Valor</th>
                    <th className="text-left py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {agendamentos.map((agendamento) => {
                    const diarista = diaristas.find((d) => d.id === agendamento.diaristaId);
                    return (
                      <tr key={agendamento.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">{diarista?.nome || "—"}</td>
                        <td className="py-2 px-2">{agendamento.especialidade || "—"}</td>
                        <td className="py-2 px-2">{agendamento.enderecoServico || "—"}</td>
                        <td className="py-2 px-2">{formatDate(agendamento.dataInicio)}</td>
                        <td className="py-2 px-2">{formatDate(agendamento.dataFim)}</td>
                        <td className="py-2 px-2 text-right font-semibold">
                          {formatCurrency(agendamento.valorServico || 0)}
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              agendamento.status === "concluido"
                                ? "bg-green-100 text-green-800"
                                : agendamento.status === "cancelado"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {agendamento.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pagamentos ({pagamentos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Diarista</th>
                    <th className="text-left py-2 px-2">Data</th>
                    <th className="text-left py-2 px-2">Método</th>
                    <th className="text-right py-2 px-2">Valor</th>
                    <th className="text-left py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pagamentos.map((pagamento) => {
                    const agendamento = agendamentos.find((a) => a.id === pagamento.agendamentoId);
                    const diarista = diaristas.find((d) => d.id === agendamento?.diaristaId);
                    return (
                      <tr key={pagamento.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">{diarista?.nome || "—"}</td>
                        <td className="py-2 px-2">{formatDate(pagamento.dataPagamento || pagamento.createdAt)}</td>
                        <td className="py-2 px-2">{pagamento.metodo || "—"}</td>
                        <td className="py-2 px-2 text-right font-semibold">
                          {formatCurrency(pagamento.valor || 0)}
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              pagamento.status === "pago"
                                ? "bg-green-100 text-green-800"
                                : pagamento.status === "cancelado"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {pagamento.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total em Agendamentos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(agendamentos.reduce((acc, a) => acc + (a.valorServico || 0), 0))}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total em Pagamentos</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(calcularTotais(pagamentos))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Relatórios</h1>
            <p className="text-gray-600 mt-2">Analise agendamentos e pagamentos por diferentes critérios</p>
          </div>
          <Button onClick={() => setLocation("/")} variant="outline">
            ← Voltar
          </Button>
        </div>

        <Tabs value={filtroTipo} onValueChange={(value) => setFiltroTipo(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="diarista">👤 Por Diarista</TabsTrigger>
            <TabsTrigger value="data">📅 Por Data</TabsTrigger>
            <TabsTrigger value="operacao">📍 Por Operação</TabsTrigger>
          </TabsList>

          {/* Relatório por Diarista */}
          <TabsContent value="diarista" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Filtrar por Diarista</CardTitle>
                <CardDescription>Selecione uma diarista para ver todos os agendamentos e pagamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="diarista-select">Diarista</Label>
                    <Select value={diaristaId} onValueChange={setDiaristaId}>
                      <SelectTrigger id="diarista-select">
                        <SelectValue placeholder="Selecione uma diarista" />
                      </SelectTrigger>
                      <SelectContent>
                        {diaristas.map((d) => (
                          <SelectItem key={d.id} value={d.id.toString()}>
                            {d.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {diaristaId && renderRelatorioAgendamentos(agendamentosPorDiarista, pagamentosPorDiarista)}
          </TabsContent>

          {/* Relatório por Data */}
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Filtrar por Data</CardTitle>
                <CardDescription>Selecione um período para ver agendamentos e pagamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="data-inicio">Data Início</Label>
                      <Input
                        id="data-inicio"
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="data-fim">Data Fim</Label>
                      <Input
                        id="data-fim"
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {dataInicio && dataFim && renderRelatorioAgendamentos(agendamentosPorData, pagamentosPorData)}
          </TabsContent>

          {/* Relatório por Operação */}
          <TabsContent value="operacao" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Filtrar por Operação</CardTitle>
                <CardDescription>Selecione um local de serviço para ver agendamentos e pagamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="operacao-select">Local de Serviço</Label>
                    <Select value={operacao} onValueChange={setOperacao}>
                      <SelectTrigger id="operacao-select">
                        <SelectValue placeholder="Selecione um local" />
                      </SelectTrigger>
                      <SelectContent>
                        {operacoes.map((op) => (
                          <SelectItem key={op} value={op}>
                            {op}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {operacao && renderRelatorioAgendamentos(agendamentosPorOperacao, pagamentosPorOperacao)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


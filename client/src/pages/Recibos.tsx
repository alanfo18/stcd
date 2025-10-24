import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Recibos() {
  const [, setLocation] = useLocation();
  const [selectedPagamento, setSelectedPagamento] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: pagamentos = [] } = trpc.pagamento.list.useQuery();
  const { data: agendamentos = [] } = trpc.agendamento.list.useQuery();
  const { data: diaristas = [] } = trpc.diarista.list.useQuery();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  const gerarRecibo = (pagamento: any) => {
    const agendamento = agendamentos.find((a) => a.id === pagamento.agendamentoId);
    const diarista = diaristas.find((d) => d.id === agendamento?.diaristaId);

    const recibo = `
╔════════════════════════════════════════════════════════════════╗
║                    067 VINHOS LTDA                             ║
║                   CNPJ: 34.257.880/0001-06                     ║
║              R Manoel Laburu, 83 - Campo Grande, MS            ║
║                                                                ║
║                    RECIBO DE PAGAMENTO                         ║
╚════════════════════════════════════════════════════════════════╝

DADOS DO RECEBEDOR:
Nome: ${diarista?.nome || "—"}
Telefone: ${diarista?.telefone || "—"}
CPF/CNPJ: ___________________________

DADOS DO SERVIÇO:
Descrição: ${agendamento?.descricaoServico || "Serviço de Limpeza"}
Data de Início: ${formatDate(agendamento?.dataInicio || new Date())}
Data de Término: ${formatDate(agendamento?.dataFim || new Date())}
Local: ${agendamento?.enderecoServico || "—"}

DADOS DO PAGAMENTO:
Valor: ${formatCurrency(pagamento.valor)}
Método: ${pagamento.metodo}
Data: ${formatDate(pagamento.dataPagamento || pagamento.createdAt)}
Status: ${pagamento.status.toUpperCase()}

OBSERVAÇÕES LEGAIS:
Este recibo comprova o pagamento de serviço prestado conforme
legislação trabalhista vigente. O recebedor declara ter recebido
a quantia acima em perfeito estado.

Assinatura do Recebedor: ___________________________

Data: ${new Date().toLocaleDateString("pt-BR")}

═══════════════════════════════════════════════════════════════════
    Documento gerado automaticamente pelo Sistema de Controle
    de Diaristas (STCD) - 067 Vinhos
═══════════════════════════════════════════════════════════════════
    `;

    // Copiar para clipboard
    navigator.clipboard.writeText(recibo);
    alert("Recibo copiado para a área de transferência!\nVocê pode colar em um documento ou imprimir.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📋 Recibos</h1>
            <p className="text-gray-600 mt-1">Gere e gerencie recibos de pagamento</p>
          </div>
          <Button onClick={() => setLocation("/")} variant="outline" className="mr-2">
            ← Voltar
          </Button>
        </div>

        {pagamentos.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-600">Nenhum pagamento registrado ainda.</p>
              <Button onClick={() => setLocation("/pagamentos")} className="mt-4 bg-green-600 hover:bg-green-700">
                Registrar Primeiro Pagamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pagamentos.map((pagamento) => {
              const agendamento = agendamentos.find((a) => a.id === pagamento.agendamentoId);
              const diarista = diaristas.find((d) => d.id === agendamento?.diaristaId);

              return (
                <Card key={pagamento.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{diarista?.nome || "Diarista"}</CardTitle>
                        <CardDescription>{agendamento?.enderecoServico || "—"}</CardDescription>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          pagamento.status === "pago"
                            ? "bg-green-100 text-green-800"
                            : pagamento.status === "pendente"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {pagamento.status.toUpperCase()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Valor:</span>
                        <p className="font-semibold text-green-600">{formatCurrency(pagamento.valor)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Método:</span>
                        <p className="font-semibold">{pagamento.metodo}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Data:</span>
                        <p className="font-semibold">{formatDate(pagamento.dataPagamento || pagamento.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Telefone:</span>
                        <p className="font-semibold">{diarista?.telefone || "—"}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3">
                      <Dialog open={isOpen && selectedPagamento?.id === pagamento.id} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => setSelectedPagamento(pagamento)}
                          >
                            📄 Visualizar Recibo
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Recibo de Pagamento</DialogTitle>
                            <DialogDescription>
                              Recibo para {diarista?.nome || "Diarista"}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap break-words">
                            {`
╔════════════════════════════════════════════════════════════════╗
║                    067 VINHOS LTDA                             ║
║                   CNPJ: 34.257.880/0001-06                     ║
║              R Manoel Laburu, 83 - Campo Grande, MS            ║
║                                                                ║
║                    RECIBO DE PAGAMENTO                         ║
╚════════════════════════════════════════════════════════════════╝

DADOS DO RECEBEDOR:
Nome: ${diarista?.nome || "—"}
Telefone: ${diarista?.telefone || "—"}
CPF/CNPJ: ___________________________

DADOS DO SERVIÇO:
Descrição: ${agendamento?.descricaoServico || "Serviço de Limpeza"}
Data de Início: ${formatDate(agendamento?.dataInicio || new Date())}
Data de Término: ${formatDate(agendamento?.dataFim || new Date())}
Local: ${agendamento?.enderecoServico || "—"}

DADOS DO PAGAMENTO:
Valor: ${formatCurrency(pagamento.valor)}
Método: ${pagamento.metodo}
Data: ${formatDate(pagamento.dataPagamento || pagamento.createdAt)}
Status: ${pagamento.status.toUpperCase()}

OBSERVAÇÕES LEGAIS:
Este recibo comprova o pagamento de serviço prestado conforme
legislação trabalhista vigente. O recebedor declara ter recebido
a quantia acima em perfeito estado.

Assinatura do Recebedor: ___________________________

Data: ${new Date().toLocaleDateString("pt-BR")}

═══════════════════════════════════════════════════════════════════
    Documento gerado automaticamente pelo Sistema de Controle
    de Diaristas (STCD) - 067 Vinhos
═══════════════════════════════════════════════════════════════════
                            `}
                          </div>
                          <Button
                            onClick={() => gerarRecibo(pagamento)}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            📋 Copiar Recibo
                          </Button>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.print()}
                      >
                        🖨️ Imprimir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


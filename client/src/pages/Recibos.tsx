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
Email: ${diarista?.email || "—"}
CPF/CNPJ: ${diarista?.cpf || "___________________________"}
Endereço: ${diarista?.endereco || "—"}
Cidade: ${diarista?.cidade || "—"} - ${diarista?.estado || "—"}
CEP: ${diarista?.cep || "—"}

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

  const imprimirRecibo = (pagamento: any) => {
    const agendamento = agendamentos.find((a) => a.id === pagamento.agendamentoId);
    const diarista = diaristas.find((d) => d.id === agendamento?.diaristaId);

    const reciboHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Recibo - ${diarista?.nome || "Diarista"}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          margin: 20px;
          background: white;
        }
        .recibo {
          max-width: 800px;
          margin: 0 auto;
          border: 2px solid #000;
          padding: 20px;
          background: white;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .header p {
          margin: 5px 0;
          font-size: 12px;
        }
        .section {
          margin-bottom: 15px;
        }
        .section h3 {
          margin: 10px 0 5px 0;
          font-size: 14px;
          border-bottom: 1px solid #000;
        }
        .field {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          font-size: 12px;
        }
        .label {
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 11px;
          border-top: 2px solid #000;
          padding-top: 10px;
        }
        .signature {
          margin-top: 40px;
          display: flex;
          justify-content: space-around;
        }
        .signature-line {
          text-align: center;
          font-size: 12px;
        }
        .signature-line p {
          margin: 0;
          padding-top: 30px;
          border-top: 1px solid #000;
        }
        /* Responsivo para tablets */
        @media (max-width: 768px) {
          body {
            margin: 10px;
          }
          .recibo {
            max-width: 100%;
            padding: 15px;
            border: 1px solid #000;
          }
          .header h1 {
            font-size: 18px;
          }
          .header p {
            font-size: 10px;
          }
          .section h3 {
            font-size: 12px;
          }
          .field {
            font-size: 10px;
            flex-wrap: wrap;
          }
          .footer {
            font-size: 9px;
          }
          .signature {
            margin-top: 20px;
            flex-direction: column;
            gap: 15px;
          }
          .signature-line {
            font-size: 10px;
          }
        }
        /* Responsivo para celulares */
        @media (max-width: 480px) {
          body {
            margin: 5px;
          }
          .recibo {
            max-width: 100%;
            padding: 10px;
            border: 1px solid #000;
          }
          .header h1 {
            font-size: 14px;
          }
          .header p {
            font-size: 8px;
          }
          .section {
            margin-bottom: 10px;
          }
          .section h3 {
            font-size: 10px;
            margin: 8px 0 3px 0;
          }
          .field {
            font-size: 8px;
            margin: 3px 0;
            flex-wrap: wrap;
          }
          .label {
            min-width: 80px;
          }
          .footer {
            margin-top: 15px;
            font-size: 7px;
          }
          .signature {
            margin-top: 15px;
            flex-direction: column;
            gap: 10px;
          }
          .signature-line {
            font-size: 8px;
          }
          .signature-line p {
            padding-top: 15px;
          }
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .recibo {
            max-width: 100%;
            border: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="recibo">
        <div class="header">
          <h1>067 VINHOS LTDA</h1>
          <p>CNPJ: 34.257.880/0001-06</p>
          <p>R Manoel Laburu, 83 - Campo Grande, MS</p>
          <h2 style="margin: 10px 0 0 0; font-size: 18px;">RECIBO DE PAGAMENTO</h2>
        </div>

        <div class="section">
          <h3>DADOS DO RECEBEDOR</h3>
          <div class="field">
            <span class="label">Nome:</span>
            <span>${diarista?.nome || "—"}</span>
          </div>
          <div class="field">
            <span class="label">Telefone:</span>
            <span>${diarista?.telefone || "—"}</span>
          </div>
          <div class="field">
            <span class="label">Email:</span>
            <span>${diarista?.email || "—"}</span>
          </div>
          <div class="field">
            <span class="label">CPF/CNPJ:</span>
            <span>${diarista?.cpf || "_________________________"}</span>
          </div>
          <div class="field">
            <span class="label">Endereço:</span>
            <span>${diarista?.endereco || "—"}</span>
          </div>
          <div class="field">
            <span class="label">Cidade/Estado:</span>
            <span>${diarista?.cidade || "—"} - ${diarista?.estado || "—"}</span>
          </div>
          <div class="field">
            <span class="label">CEP:</span>
            <span>${diarista?.cep || "—"}</span>
          </div>
        </div>

        <div class="section">
          <h3>DADOS DO SERVIÇO</h3>
          <div class="field">
            <span class="label">Descrição:</span>
            <span>${agendamento?.descricaoServico || "Serviço de Limpeza"}</span>
          </div>
          <div class="field">
            <span class="label">Data de Início:</span>
            <span>${formatDate(agendamento?.dataInicio || new Date())}</span>
          </div>
          <div class="field">
            <span class="label">Data de Término:</span>
            <span>${formatDate(agendamento?.dataFim || new Date())}</span>
          </div>
          <div class="field">
            <span class="label">Local:</span>
            <span>${agendamento?.enderecoServico || "—"}</span>
          </div>
        </div>

        <div class="section">
          <h3>DADOS DO PAGAMENTO</h3>
          <div class="field">
            <span class="label">Valor:</span>
            <span>${formatCurrency(pagamento.valor)}</span>
          </div>
          <div class="field">
            <span class="label">Método:</span>
            <span>${pagamento.metodo}</span>
          </div>
          <div class="field">
            <span class="label">Data:</span>
            <span>${formatDate(pagamento.dataPagamento || pagamento.createdAt)}</span>
          </div>
          <div class="field">
            <span class="label">Status:</span>
            <span>${pagamento.status.toUpperCase()}</span>
          </div>
        </div>

        <div class="section">
          <h3>OBSERVAÇÕES LEGAIS</h3>
          <p style="font-size: 12px; line-height: 1.6;">
            Este recibo comprova o pagamento de serviço prestado conforme legislação trabalhista vigente. 
            O recebedor declara ter recebido a quantia acima em perfeito estado.
          </p>
        </div>

        <div class="signature">
          <div class="signature-line">
            <p>Assinatura do Recebedor</p>
          </div>
          <div class="signature-line">
            <p>Assinatura da Empresa</p>
          </div>
        </div>

        <div class="footer">
          <p>Data: ${new Date().toLocaleDateString("pt-BR")}</p>
          <p style="margin-top: 20px; border-top: 1px solid #000; padding-top: 10px;">
            Documento gerado automaticamente pelo Sistema de Controle de Diaristas (STCD) - 067 Vinhos
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    const printWindow = window.open("", "", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(reciboHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
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
Email: ${diarista?.email || "—"}
CPF/CNPJ: ${diarista?.cpf || "___________________________"}
Endereço: ${diarista?.endereco || "—"}
Cidade: ${diarista?.cidade || "—"} - ${diarista?.estado || "—"}
CEP: ${diarista?.cep || "—"}

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
                          <div className="flex gap-2 pt-4">
                            <Button
                              onClick={() => gerarRecibo(pagamento)}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              📋 Copiar Recibo
                            </Button>
                            <Button
                              onClick={() => imprimirRecibo(pagamento)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                              🖨️ Imprimir
                            </Button>
                          </div>
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


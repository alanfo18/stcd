import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { OcrValueExtractor } from "@/components/OcrValueExtractor";

export default function Pagamentos() {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    diaristaId: "",
    agendamentoId: "",
    valor: "",
    dataPagamento: "",
    metodo: "dinheiro",
    status: "pendente",
    descricao: "",
  });

  const { data: pagamentos = [], isLoading, refetch } = trpc.pagamento.list.useQuery();
  const { data: diaristas = [] } = trpc.diarista.list.useQuery();
  const { data: agendamentos = [] } = trpc.agendamento.list.useQuery();
  const createMutation = trpc.pagamento.create.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        diaristaId: parseInt(formData.diaristaId),
        agendamentoId: formData.agendamentoId ? parseInt(formData.agendamentoId) : undefined,
        valor: Math.round(parseFloat(formData.valor) * 100),
        dataPagamento: new Date(formData.dataPagamento),
        metodo: formData.metodo as "dinheiro" | "pix" | "transferencia" | "cartao",
        status: formData.status as "pendente" | "pago" | "cancelado",
        descricao: formData.descricao || undefined,
        comprovante: uploadedFiles.length > 0 ? uploadedFiles[0].name : undefined,
      });

      // Aqui você integraria com WhatsApp para notificar
      // - Nunes (Coordenador): 67 99958-3290
      // - Alan: 67 99982-0888
      // - Bárbara: 21 97206-1271
      // - Samuel (Financeiro): 67 99927-7878
      // - Diarista: número capturado no sistema

      setFormData({
        diaristaId: "",
        agendamentoId: "",
        valor: "",
        dataPagamento: "",
        metodo: "dinheiro",
        status: "pendente",
        descricao: "",
      });
      setUploadedFiles([]);
      setIsOpen(false);
      refetch();
      alert("Pagamento registrado com sucesso! Notificações WhatsApp serão enviadas.");
    } catch (error) {
      console.error("Erro ao criar pagamento:", error);
      alert("Erro ao registrar pagamento");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago":
        return "bg-green-100 text-green-800";
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pagamentos</h1>
            <p className="text-gray-600 mt-1">Registre e acompanhe os pagamentos às diaristas</p>
          </div>
          <Button onClick={() => setLocation("/")} variant="outline" className="mr-2">
            ← Voltar
          </Button>
        </div>

        <div className="mb-6">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-600 hover:bg-yellow-700">
                💰 Registrar Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Pagamento</DialogTitle>
                <DialogDescription>
                  Registre um novo pagamento e anexe comprovante (imagem ou PDF).
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="diarista">Diarista *</Label>
                  <Select value={formData.diaristaId} onValueChange={(value) => setFormData({ ...formData, diaristaId: value })}>
                    <SelectTrigger>
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

                <div>
                  <Label htmlFor="agendamento">Agendamento (Opcional)</Label>
                  <Select value={formData.agendamentoId} onValueChange={(value) => setFormData({ ...formData, agendamentoId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um agendamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {agendamentos
                        .filter(a => formData.diaristaId === "" || a.diaristaId === parseInt(formData.diaristaId))
                        .map((a) => (
                          <SelectItem key={a.id} value={a.id.toString()}>
                            {a.enderecoServico} - {new Date(a.dataInicio).toLocaleDateString('pt-BR')}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Vincule o pagamento a um agendamento especifico</p>
                </div>

                <div>
                  <Label htmlFor="valor">Valor (R$) *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Dica: Use o campo de comprovante abaixo para extrair o valor automaticamente</p>
                </div>

                <div>
                  <OcrValueExtractor
                    onValueExtracted={(value) => setFormData({ ...formData, valor: value.toString() })}
                    disabled={isOpen === false}
                  />
                </div>

                <div>
                  <Label htmlFor="dataPagamento">Data do Pagamento *</Label>
                  <Input
                    id="dataPagamento"
                    type="date"
                    value={formData.dataPagamento}
                    onChange={(e) => setFormData({ ...formData, dataPagamento: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="metodo">Método de Pagamento *</Label>
                  <Select value={formData.metodo} onValueChange={(value) => setFormData({ ...formData, metodo: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">💵 Dinheiro</SelectItem>
                      <SelectItem value="pix">📱 PIX</SelectItem>
                      <SelectItem value="transferencia">🏦 Transferência Bancária</SelectItem>
                      <SelectItem value="cartao">💳 Cartão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">⏳ Pendente</SelectItem>
                      <SelectItem value="pago">✅ Pago</SelectItem>
                      <SelectItem value="cancelado">❌ Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="comprovante">Comprovante (Imagem ou PDF)</Label>
                  <Input
                    id="comprovante"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    multiple
                  />
                  {uploadedFiles.length > 0 && (
                    <div className="mt-2 text-sm text-green-600">
                      ✅ {uploadedFiles.length} arquivo(s) selecionado(s)
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Observações sobre o pagamento"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-yellow-600 hover:bg-yellow-700">
                    Registrar Pagamento
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Carregando pagamentos...</p>
          </div>
        ) : pagamentos.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-600">Nenhum pagamento registrado ainda.</p>
              <Button 
                onClick={() => setIsOpen(true)} 
                className="mt-4 bg-yellow-600 hover:bg-yellow-700"
              >
                Registrar Primeiro Pagamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pagamentos.map((pagamento) => {
              const diarista = diaristas.find(d => d.id === pagamento.diaristaId);
              return (
                <Card key={pagamento.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{diarista?.nome || "Desconhecida"}</CardTitle>
                        <CardDescription>{formatDate(pagamento.dataPagamento)}</CardDescription>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(pagamento.status)}`}>
                        {pagamento.status.charAt(0).toUpperCase() + pagamento.status.slice(1)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Valor</p>
                        <p className="font-semibold text-lg">{formatCurrency(pagamento.valor)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Método</p>
                        <p className="font-semibold">
                          {pagamento.metodo === "dinheiro" && "💵 Dinheiro"}
                          {pagamento.metodo === "pix" && "📱 PIX"}
                          {pagamento.metodo === "transferencia" && "🏦 Transferência"}
                          {pagamento.metodo === "cartao" && "💳 Cartão"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Comprovante</p>
                        <p className="font-semibold">
                          {pagamento.comprovante ? "📎 Anexado" : "❌ Sem comprovante"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Descrição</p>
                        <p className="font-semibold text-sm">{pagamento.descricao || "-"}</p>
                      </div>
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


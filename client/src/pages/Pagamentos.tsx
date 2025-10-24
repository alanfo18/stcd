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

export default function Pagamentos() {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    diaristaId: "",
    agendamentoId: "",
    valor: "",
    dataPagamento: "",
    metodo: "pix",
    status: "pago",
    descricao: "",
    comprovante: "",
  });

  const { data: pagamentos = [], isLoading, refetch } = trpc.pagamento.list.useQuery();
  const { data: diaristas = [] } = trpc.diarista.list.useQuery();
  const createMutation = trpc.pagamento.create.useMutation();
  const updateMutation = trpc.pagamento.update.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        diaristaId: parseInt(formData.diaristaId),
        agendamentoId: formData.agendamentoId ? parseInt(formData.agendamentoId) : undefined,
        valor: parseInt(formData.valor) * 100,
        dataPagamento: new Date(formData.dataPagamento),
        metodo: formData.metodo as "dinheiro" | "pix" | "transferencia" | "cartao",
        status: formData.status as "pendente" | "pago" | "cancelado",
        descricao: formData.descricao || undefined,
        comprovante: formData.comprovante || undefined,
      });
      setFormData({
        diaristaId: "",
        agendamentoId: "",
        valor: "",
        dataPagamento: "",
        metodo: "pix",
        status: "pago",
        descricao: "",
        comprovante: "",
      });
      setIsOpen(false);
      refetch();
    } catch (error) {
      console.error("Erro ao criar pagamento:", error);
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

  const getMetodoLabel = (metodo: string) => {
    const labels: Record<string, string> = {
      dinheiro: "💵 Dinheiro",
      pix: "📱 PIX",
      transferencia: "🏦 Transferência",
      cartao: "💳 Cartão",
    };
    return labels[metodo] || metodo;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pagamentos</h1>
            <p className="text-gray-600 mt-1">Registre e controle os pagamentos às diaristas</p>
          </div>
          <Button onClick={() => setLocation("/")} variant="outline" className="mr-2">
            ← Voltar
          </Button>
        </div>

        <div className="mb-6">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                ➕ Registrar Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Novo Pagamento</DialogTitle>
                <DialogDescription>
                  Registre um pagamento realizado a uma diarista.
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
                      <SelectItem value="transferencia">🏦 Transferência</SelectItem>
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
                      <SelectItem value="pago">✅ Pago</SelectItem>
                      <SelectItem value="pendente">⏳ Pendente</SelectItem>
                      <SelectItem value="cancelado">❌ Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição do pagamento (opcional)"
                  />
                </div>

                <div>
                  <Label htmlFor="comprovante">Comprovante (URL ou caminho)</Label>
                  <Input
                    id="comprovante"
                    value={formData.comprovante}
                    onChange={(e) => setFormData({ ...formData, comprovante: e.target.value })}
                    placeholder="URL do comprovante"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                    Registrar
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
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                Registrar Primeiro Pagamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pagamentos.map((pagamento) => (
              <Card key={pagamento.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{formatCurrency(pagamento.valor)}</CardTitle>
                      <CardDescription>Diarista ID: {pagamento.diaristaId}</CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(pagamento.status)}`}>
                      {pagamento.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Data:</span>
                      <p className="font-semibold">{formatDate(pagamento.dataPagamento)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Método:</span>
                      <p className="font-semibold">{getMetodoLabel(pagamento.metodo)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Agendamento:</span>
                      <p className="font-semibold">{pagamento.agendamentoId || "—"}</p>
                    </div>
                  </div>
                  {pagamento.descricao && (
                    <div>
                      <span className="text-sm text-gray-600">Descrição:</span>
                      <p className="text-sm">{pagamento.descricao}</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Ver Comprovante
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


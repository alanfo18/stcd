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

const ENDERECOS = [
  "Havalon",
  "Cantina Havalon",
  "Pegasus",
  "Cantina Pegasus",
  "Aeroporto",
  "Quiosque",
  "Ima",
];

export default function Agendamentos() {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    diaristaId: "",
    especialidadeId: "",
    telefoneCliente: "",
    enderecoServico: "",
    dataInicio: "",
    dataFim: "",
    valorDiaria: "",
    descricaoServico: "",
    observacoes: "",
  });

  const { data: agendamentos = [], isLoading, refetch } = trpc.agendamento.list.useQuery();
  const { data: diaristas = [] } = trpc.diarista.list.useQuery();
  const { data: especialidades = [] } = trpc.especialidade.list.useQuery();
  const createMutation = trpc.agendamento.create.useMutation();
  const updateMutation = trpc.agendamento.update.useMutation();
  const deleteMutation = trpc.agendamento.delete.useMutation();

  const handleEdit = (agendamento: any) => {
    setEditingId(agendamento.id);
    setFormData({
      diaristaId: agendamento.diaristaId.toString(),
      especialidadeId: agendamento.especialidadeId.toString(),
      telefoneCliente: agendamento.telefoneCliente || "",
      enderecoServico: agendamento.enderecoServico,
      dataInicio: new Date(agendamento.dataInicio).toISOString().split('T')[0],
      dataFim: new Date(agendamento.dataFim).toISOString().split('T')[0],
      valorDiaria: (agendamento.valorDiaria / 100).toFixed(2),
      descricaoServico: agendamento.descricaoServico || "",
      observacoes: agendamento.observacoes || "",
    });
    setIsOpen(true);
  };

  const calcularValorDiaria = () => {
    if (!formData.valorDiaria || !formData.dataInicio || !formData.dataFim) return 0;

    const inicio = new Date(formData.dataInicio);
    const fim = new Date(formData.dataFim);
    const diasTrabalhados = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return parseFloat(formData.valorDiaria) * diasTrabalhados;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const valorCalculado = calcularValorDiaria(); // Valor em reais
      
      if (editingId) {
        const updateData = {
          diaristaId: parseInt(formData.diaristaId),
          especialidadeId: parseInt(formData.especialidadeId),
          nomeCliente: "Cliente",
          telefoneCliente: formData.telefoneCliente || undefined,
          enderecoServico: formData.enderecoServico,
          dataInicio: new Date(formData.dataInicio),
          dataFim: new Date(formData.dataFim),
          valorDiaria: Math.round(parseFloat(formData.valorDiaria) * 100) || 0, // Armazenar em centavos
          descricaoServico: formData.descricaoServico || undefined,
          valorServico: valorCalculado > 0 ? Math.round(valorCalculado) : undefined,
          observacoes: formData.observacoes || undefined,
        };
        await updateMutation.mutateAsync({ id: editingId, ...updateData });
      } else {
        await createMutation.mutateAsync({
          diaristaId: parseInt(formData.diaristaId),
          especialidadeId: parseInt(formData.especialidadeId),
          nomeCliente: "Cliente",
          telefoneCliente: formData.telefoneCliente || undefined,
          enderecoServico: formData.enderecoServico,
          dataInicio: new Date(formData.dataInicio),
          dataFim: new Date(formData.dataFim),
          valorDiaria: Math.round(parseFloat(formData.valorDiaria) * 100) || 0, // Armazenar em centavos
          descricaoServico: formData.descricaoServico || undefined,
          valorServico: valorCalculado > 0 ? Math.round(valorCalculado) : undefined,
          observacoes: formData.observacoes || undefined,
        });
      }
      setFormData({
        diaristaId: "",
        especialidadeId: "",
        telefoneCliente: "",
        enderecoServico: "",
        dataInicio: "",
        dataFim: "",
        valorDiaria: "",
        descricaoServico: "",
        observacoes: "",
      });
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error("Erro ao deletar agendamento:", error);
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado":
        return "bg-blue-100 text-blue-800";
      case "concluido":
        return "bg-green-100 text-green-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
            <p className="text-gray-600 mt-1">Gerencie os serviços agendados</p>
          </div>
          <Button onClick={() => setLocation("/")} variant="outline" className="mr-2">
            ← Voltar
          </Button>
        </div>

        <div className="mb-6">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                ➕ Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Agendamento" : "Agendar Novo Serviço"}</DialogTitle>
                <DialogDescription>
                  {editingId ? "Atualize os dados do agendamento." : "Preencha os dados do agendamento para criar um novo serviço."}
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
                  <Label htmlFor="especialidade">Especialidade *</Label>
                  <Select value={formData.especialidadeId} onValueChange={(value) => setFormData({ ...formData, especialidadeId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {especialidades.map((e) => (
                        <SelectItem key={e.id} value={e.id.toString()}>
                          {e.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                  <Label htmlFor="enderecoServico" className="text-lg font-bold text-blue-900">📍 Local de Serviço (Operação) *</Label>
                  <Select value={formData.enderecoServico} onValueChange={(value) => setFormData({ ...formData, enderecoServico: value })}>
                    <SelectTrigger className="mt-2 border-2 border-blue-400 bg-white">
                      <SelectValue placeholder="Selecione o local" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENDERECOS.map((local) => (
                        <SelectItem key={local} value={local}>
                          {local}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="telefoneCliente">Telefone do Cliente</Label>
                  <Input
                    id="telefoneCliente"
                    value={formData.telefoneCliente}
                    onChange={(e) => setFormData({ ...formData, telefoneCliente: e.target.value })}
                    placeholder="(XX) XXXXX-XXXX"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataInicio">Data de Início *</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={formData.dataInicio}
                      onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataFim">Data de Fim *</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={formData.dataFim}
                      onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="valorDiaria">💵 Valor da Diária (R$) *</Label>
                  <Input
                    id="valorDiaria"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valorDiaria}
                    onChange={(e) => setFormData({ ...formData, valorDiaria: e.target.value })}
                    placeholder="Ex: 150.00"
                    required
                  />
                </div>

                {formData.diaristaId && formData.dataInicio && formData.dataFim && formData.valorDiaria && (
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Valor estimado a receber:</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(calcularValorDiaria())}</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="descricaoServico">Descrição do Serviço</Label>
                  <Textarea
                    id="descricaoServico"
                    value={formData.descricaoServico}
                    onChange={(e) => setFormData({ ...formData, descricaoServico: e.target.value })}
                    placeholder="Descreva o serviço a ser realizado"
                  />
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Observações adicionais"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    {editingId ? "Atualizar" : "Agendar"}
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
            <p className="text-gray-600">Carregando agendamentos...</p>
          </div>
        ) : agendamentos.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-600">Nenhum agendamento realizado ainda.</p>
              <Button 
                onClick={() => setIsOpen(true)} 
                className="mt-4 bg-green-600 hover:bg-green-700"
              >
                Criar Primeiro Agendamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {agendamentos.map((agendamento) => (
              <Card key={agendamento.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{agendamento.enderecoServico}</CardTitle>
                      <CardDescription>{formatDate(agendamento.dataInicio)} até {formatDate(agendamento.dataFim)}</CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(agendamento.status)}`}>
                      {agendamento.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Diarista:</span>
                      <p className="font-semibold">{diaristas.find(d => d.id === agendamento.diaristaId)?.nome || "—"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Especialidade:</span>
                      <p className="font-semibold">{especialidades.find(e => e.id === agendamento.especialidadeId)?.nome || "—"}</p>
                    </div>

                    <div>
                      <span className="text-sm text-gray-600">Valor:</span>
                      <p className="font-semibold text-green-600">
                        {agendamento.valorServico ? formatCurrency(agendamento.valorServico / 100) : "—"}
                      </p>
                    </div>
                  </div>
                  {agendamento.descricaoServico && (
                    <div>
                      <span className="text-sm text-gray-600">Descrição:</span>
                      <p className="text-sm">{agendamento.descricaoServico}</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleEdit(agendamento)}
                    >
                      ✏️ Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleDelete(agendamento.id)}
                    >
                      🗑️ Cancelar
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


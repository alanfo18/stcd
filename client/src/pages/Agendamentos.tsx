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

export default function Agendamentos() {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    diaristaId: "",
    especialidadeId: "",
    nomeCliente: "",
    telefoneCliente: "",
    enderecoServico: "",
    dataServico: "",
    horaInicio: "",
    horaFim: "",
    descricaoServico: "",
    valorServico: "",
    observacoes: "",
  });

  const { data: agendamentos = [], isLoading, refetch } = trpc.agendamento.list.useQuery();
  const { data: diaristas = [] } = trpc.diarista.list.useQuery();
  const { data: especialidades = [] } = trpc.especialidade.list.useQuery();
  const createMutation = trpc.agendamento.create.useMutation();
  const updateMutation = trpc.agendamento.update.useMutation();
  const deleteMutation = trpc.agendamento.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        diaristaId: parseInt(formData.diaristaId),
        especialidadeId: parseInt(formData.especialidadeId),
        nomeCliente: formData.nomeCliente,
        telefoneCliente: formData.telefoneCliente || undefined,
        enderecoServico: formData.enderecoServico,
        dataServico: new Date(formData.dataServico),
        horaInicio: formData.horaInicio || undefined,
        horaFim: formData.horaFim || undefined,
        descricaoServico: formData.descricaoServico || undefined,
        valorServico: formData.valorServico ? parseInt(formData.valorServico) * 100 : undefined,
        observacoes: formData.observacoes || undefined,
      });
      setFormData({
        diaristaId: "",
        especialidadeId: "",
        nomeCliente: "",
        telefoneCliente: "",
        enderecoServico: "",
        dataServico: "",
        horaInicio: "",
        horaFim: "",
        descricaoServico: "",
        valorServico: "",
        observacoes: "",
      });
      setIsOpen(false);
      refetch();
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
            <p className="text-gray-600 mt-1">Gerencie os agendamentos de serviços</p>
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
                <DialogTitle>Novo Agendamento</DialogTitle>
                <DialogDescription>
                  Preencha os dados do agendamento de serviço.
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

                <div>
                  <Label htmlFor="nomeCliente">Nome do Cliente *</Label>
                  <Input
                    id="nomeCliente"
                    value={formData.nomeCliente}
                    onChange={(e) => setFormData({ ...formData, nomeCliente: e.target.value })}
                    placeholder="Nome do cliente"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="telefoneCliente">Telefone do Cliente</Label>
                  <Input
                    id="telefoneCliente"
                    value={formData.telefoneCliente}
                    onChange={(e) => setFormData({ ...formData, telefoneCliente: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <Label htmlFor="enderecoServico">Endereço do Serviço *</Label>
                  <Input
                    id="enderecoServico"
                    value={formData.enderecoServico}
                    onChange={(e) => setFormData({ ...formData, enderecoServico: e.target.value })}
                    placeholder="Rua, número"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dataServico">Data do Serviço *</Label>
                  <Input
                    id="dataServico"
                    type="date"
                    value={formData.dataServico}
                    onChange={(e) => setFormData({ ...formData, dataServico: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="horaInicio">Hora de Início</Label>
                    <Input
                      id="horaInicio"
                      type="time"
                      value={formData.horaInicio}
                      onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="horaFim">Hora de Fim</Label>
                    <Input
                      id="horaFim"
                      type="time"
                      value={formData.horaFim}
                      onChange={(e) => setFormData({ ...formData, horaFim: e.target.value })}
                    />
                  </div>
                </div>

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
                  <Label htmlFor="valorServico">Valor do Serviço (R$)</Label>
                  <Input
                    id="valorServico"
                    type="number"
                    step="0.01"
                    value={formData.valorServico}
                    onChange={(e) => setFormData({ ...formData, valorServico: e.target.value })}
                    placeholder="0.00"
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
                    Agendar
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
                      <CardTitle>{agendamento.nomeCliente}</CardTitle>
                      <CardDescription>{agendamento.enderecoServico}</CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(agendamento.status)}`}>
                      {agendamento.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Data:</span>
                      <p className="font-semibold">{formatDate(agendamento.dataServico)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Horário:</span>
                      <p className="font-semibold">{agendamento.horaInicio || "—"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Telefone:</span>
                      <p className="font-semibold">{agendamento.telefoneCliente || "—"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Valor:</span>
                      <p className="font-semibold text-green-600">
                        {agendamento.valorServico ? `R$ ${(agendamento.valorServico / 100).toFixed(2)}` : "—"}
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
                    <Button size="sm" variant="outline" className="flex-1">
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleDelete(agendamento.id)}
                    >
                      Cancelar
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


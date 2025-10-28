import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { AgendamentoForm } from "./AgendamentoForm";

export default function Agendamentos() {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: agendamentos = [], isLoading, refetch } = trpc.agendamento.list.useQuery();
  const { data: diaristas = [] } = trpc.diarista.list.useQuery();
  const { data: especialidades = [] } = trpc.especialidade.list.useQuery();
  const deleteMutation = trpc.agendamento.delete.useMutation();

  const handleEdit = (agendamento: any) => {
    setEditingId(agendamento.id);
    setIsOpen(true);
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingId(null);
            }
          }}>
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
              {isOpen && (
                <AgendamentoForm
                  key={`${editingId}-${isOpen}`}
                  editingId={editingId}
                  onSuccess={() => {
                    setEditingId(null);
                    setIsOpen(false);
                    refetch();
                  }}
                  onCancel={() => setIsOpen(false)}
                  diaristas={diaristas}
                  especialidades={especialidades}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Carregando agendamentos...</p>
          </div>
        ) : agendamentos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {agendamentos.map((agendamento) => (
              <Card key={agendamento.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {diaristas.find(d => d.id === agendamento.diaristaId)?.nome || "—"}
                      </CardTitle>
                      <CardDescription>
                        {formatDate(agendamento.dataInicio)} até {formatDate(agendamento.dataFim)}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Local:</p>
                      <p className="font-semibold">{agendamento.enderecoServico}</p>
                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          agendamento.status === 'agendado' ? 'bg-blue-100 text-blue-800' :
                          agendamento.status === 'concluido' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {agendamento.status === 'agendado' ? '📅 Agendado' :
                           agendamento.status === 'concluido' ? '✅ Concluído' :
                           '❌ Cancelado'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
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


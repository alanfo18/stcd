import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Diaristas() {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    endereco: "",
    cidade: "",
    cep: "",
    valorDiaria: "",
  });

  const { data: diaristas = [], isLoading, refetch } = trpc.diarista.list.useQuery();
  const { data: especialidades = [] } = trpc.especialidade.list.useQuery();
  const createMutation = trpc.diarista.create.useMutation();
  const updateMutation = trpc.diarista.update.useMutation();
  const deleteMutation = trpc.diarista.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        nome: formData.nome,
        telefone: formData.telefone,
        email: formData.email || undefined,
        endereco: formData.endereco || undefined,
        cidade: formData.cidade || undefined,
        cep: formData.cep || undefined,
        valorDiaria: parseInt(formData.valorDiaria) || 0,
      });
      setFormData({
        nome: "",
        telefone: "",
        email: "",
        endereco: "",
        cidade: "",
        cep: "",
        valorDiaria: "",
      });
      setIsOpen(false);
      refetch();
    } catch (error) {
      console.error("Erro ao criar diarista:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta diarista?")) {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error("Erro ao deletar diarista:", error);
      }
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
            <h1 className="text-3xl font-bold text-gray-900">Diaristas</h1>
            <p className="text-gray-600 mt-1">Gerencie suas diaristas cadastradas</p>
          </div>
          <Button onClick={() => setLocation("/")} variant="outline" className="mr-2">
            ← Voltar
          </Button>
        </div>

        <div className="mb-6">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                ➕ Adicionar Diarista
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Diarista</DialogTitle>
                <DialogDescription>
                  Preencha os dados da diarista para cadastrá-la no sistema.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome da diarista"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Rua, número"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      placeholder="São Paulo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                      placeholder="12345-678"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="valorDiaria">Valor da Diária (R$) *</Label>
                  <Input
                    id="valorDiaria"
                    type="number"
                    step="0.01"
                    value={formData.valorDiaria}
                    onChange={(e) => setFormData({ ...formData, valorDiaria: e.target.value })}
                    placeholder="100.00"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Adicionar
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
            <p className="text-gray-600">Carregando diaristas...</p>
          </div>
        ) : diaristas.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-600">Nenhuma diarista cadastrada ainda.</p>
              <Button 
                onClick={() => setIsOpen(true)} 
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Adicionar Primeira Diarista
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {diaristas.map((diarista) => (
              <Card key={diarista.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{diarista.nome}</CardTitle>
                  <CardDescription>{diarista.telefone}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {diarista.email && (
                    <div className="text-sm">
                      <span className="text-gray-600">Email: </span>
                      <span className="font-semibold">{diarista.email}</span>
                    </div>
                  )}
                  {diarista.cidade && (
                    <div className="text-sm">
                      <span className="text-gray-600">Cidade: </span>
                      <span className="font-semibold">{diarista.cidade}</span>
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="text-gray-600">Valor da Diária: </span>
                    <span className="font-semibold text-green-600">{formatCurrency(diarista.valorDiaria)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Status: </span>
                    <span className={`font-semibold ${diarista.ativa ? "text-green-600" : "text-red-600"}`}>
                      {diarista.ativa ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setLocation(`/diaristas/${diarista.id}`)}
                    >
                      Ver Detalhes
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleDelete(diarista.id)}
                    >
                      Deletar
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


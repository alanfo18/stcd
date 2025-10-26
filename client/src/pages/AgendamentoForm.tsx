import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

const ENDERECOS = [
  "Havalon",
  "Cantina Havalon",
  "Pegasus",
  "Cantina Pegasus",
  "Aeroporto",
  "Quiosque",
  "Ima",
];

interface AgendamentoFormProps {
  editingId: number | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AgendamentoForm({ editingId, onSuccess, onCancel }: AgendamentoFormProps) {
  const [formData, setFormData] = useState({
    diaristaId: "",
    especialidadeId: "",
    enderecoServico: "",
    dataInicio: "",
    dataFim: "",
    valorDiaria: "",
    descricaoServico: "",
    observacoes: "",
  });

  const { data: diaristas = [] } = trpc.diarista.list.useQuery();
  const { data: especialidades = [] } = trpc.especialidade.list.useQuery();
  const createMutation = trpc.agendamento.create.useMutation();
  const updateMutation = trpc.agendamento.update.useMutation();

  const handleSelectChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleDataInicioChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, dataInicio: e.target.value }));
  }, []);

  const handleDataFimChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, dataFim: e.target.value }));
  }, []);

  const handleValorDiariaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, valorDiaria: e.target.value }));
  }, []);

  const handleDescricaoChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, descricaoServico: e.target.value }));
  }, []);

  const handleObservacoeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, observacoes: e.target.value }));
  }, []);

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
      const valorCalculado = calcularValorDiaria();
      
      if (editingId) {
        const updateData = {
          diaristaId: parseInt(formData.diaristaId),
          especialidadeId: parseInt(formData.especialidadeId),
          enderecoServico: formData.enderecoServico,
          dataInicio: new Date(formData.dataInicio),
          dataFim: new Date(formData.dataFim),
          valorDiaria: Math.round(parseFloat(formData.valorDiaria) * 100) || 0,
          descricaoServico: formData.descricaoServico || undefined,
          valorServico: valorCalculado > 0 ? Math.round(valorCalculado * 100) : undefined,
          observacoes: formData.observacoes || undefined,
        };
        await updateMutation.mutateAsync({ id: editingId, ...updateData });
      } else {
        await createMutation.mutateAsync({
          diaristaId: parseInt(formData.diaristaId),
          especialidadeId: parseInt(formData.especialidadeId),
          enderecoServico: formData.enderecoServico,
          dataInicio: new Date(formData.dataInicio),
          dataFim: new Date(formData.dataFim),
          valorDiaria: Math.round(parseFloat(formData.valorDiaria) * 100) || 0,
          descricaoServico: formData.descricaoServico || undefined,
          valorServico: valorCalculado > 0 ? Math.round(valorCalculado * 100) : undefined,
          observacoes: formData.observacoes || undefined,
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="diarista">Diarista *</Label>
        <select
          value={formData.diaristaId}
          onChange={(e) => handleSelectChange('diaristaId', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        >
          <option value="">Selecione uma diarista</option>
          {diaristas.map((d) => (
            <option key={d.id} value={d.id.toString()}>
              {d.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="especialidade">Especialidade *</Label>
        <select
          value={formData.especialidadeId}
          onChange={(e) => handleSelectChange('especialidadeId', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        >
          <option value="">Selecione uma especialidade</option>
          {especialidades.map((e) => (
            <option key={e.id} value={e.id.toString()}>
              {e.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
        <Label htmlFor="enderecoServico" className="text-lg font-bold text-blue-900">📍 Local de Serviço (Operação) *</Label>
        <select
          value={formData.enderecoServico}
          onChange={(e) => handleSelectChange('enderecoServico', e.target.value)}
          className="w-full mt-2 px-3 py-2 border-2 border-blue-400 rounded-md bg-white"
          required
        >
          <option value="">Selecione o local</option>
          {ENDERECOS.map((local) => (
            <option key={local} value={local}>
              {local}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dataInicio">Data de Início *</Label>
          <Input
            id="dataInicio"
            type="date"
            value={formData.dataInicio}
            onChange={handleDataInicioChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="dataFim">Data de Fim *</Label>
          <Input
            id="dataFim"
            type="date"
            value={formData.dataFim}
            onChange={handleDataFimChange}
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
          onChange={handleValorDiariaChange}
          placeholder="Ex: 150.00"
          required
        />
      </div>

      {formData.diaristaId && formData.dataInicio && formData.dataFim && formData.valorDiaria && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <p className="text-sm font-semibold text-green-800">
            💰 Valor Total: R$ {calcularValorDiaria().toFixed(2)}
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="descricaoServico">Descrição do Serviço</Label>
        <Textarea
          id="descricaoServico"
          value={formData.descricaoServico}
          onChange={handleDescricaoChange}
          placeholder="Descreva o serviço a ser realizado"
        />
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={handleObservacoeChange}
          placeholder="Observações adicionais"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
          {editingId ? "Atualizar" : "Agendar"}
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}


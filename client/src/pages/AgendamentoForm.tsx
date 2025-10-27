import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
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
  diaristas: Array<{ id: number; nome: string; telefone: string }>;
  especialidades: Array<{ id: number; nome: string }>;
}

export function AgendamentoForm({ editingId, onSuccess, onCancel, diaristas, especialidades }: AgendamentoFormProps) {
  // Usar refs para armazenar os valores dos selects e inputs
  const diaristaRef = useRef<HTMLSelectElement>(null);
  const especialidadeRef = useRef<HTMLSelectElement>(null);
  const enderecoRef = useRef<HTMLSelectElement>(null);
  const dataInicioRef = useRef<HTMLInputElement>(null);
  const dataFimRef = useRef<HTMLInputElement>(null);
  const valorDiariaRef = useRef<HTMLInputElement>(null);
  const descricaoRef = useRef<HTMLTextAreaElement>(null);
  const observacoesRef = useRef<HTMLTextAreaElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = trpc.agendamento.create.useMutation();
  const updateMutation = trpc.agendamento.update.useMutation();

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!diaristaRef.current?.value) {
      newErrors.diaristaId = "Selecione uma diarista";
    }
    if (!especialidadeRef.current?.value) {
      newErrors.especialidadeId = "Selecione uma especialidade";
    }
    if (!enderecoRef.current?.value) {
      newErrors.enderecoServico = "Selecione um local de serviço";
    }
    if (!dataInicioRef.current?.value) {
      newErrors.dataInicio = "Data de início é obrigatória";
    }
    if (!dataFimRef.current?.value) {
      newErrors.dataFim = "Data de fim é obrigatória";
    }
    if (!valorDiariaRef.current?.value) {
      newErrors.valorDiaria = "Valor da diária é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calcular valor total
  const calcularValorTotal = (): number => {
    const dataInicio = dataInicioRef.current?.value;
    const dataFim = dataFimRef.current?.value;
    const valorDiaria = parseFloat(valorDiariaRef.current?.value || "0");

    if (!dataInicio || !dataFim || !valorDiaria) return 0;

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const dias = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return dias * valorDiaria;
  };

  // Handler para submeter o formulário
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Valores dos refs:', {
      diarista: diaristaRef.current?.value,
      especialidade: especialidadeRef.current?.value,
      endereco: enderecoRef.current?.value,
      dataInicio: dataInicioRef.current?.value,
      dataFim: dataFimRef.current?.value,
      valorDiaria: valorDiariaRef.current?.value,
    });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const diaristaId = parseInt(diaristaRef.current?.value || "0");
      const especialidadeId = parseInt(especialidadeRef.current?.value || "0");
      const enderecoServico = enderecoRef.current?.value || "";
      const dataInicio = dataInicioRef.current?.value || "";
      const dataFim = dataFimRef.current?.value || "";
      const valorDiaria = parseFloat(valorDiariaRef.current?.value || "0");
      const descricaoServico = descricaoRef.current?.value || "";
      const observacoes = observacoesRef.current?.value || "";

      const valorCalculado = calcularValorTotal();

      const input = {
        diaristaId,
        especialidadeId,
        enderecoServico,
        dataInicio: new Date(dataInicio + 'T00:00:00'),
        dataFim: new Date(dataFim + 'T00:00:00'),
        valorDiaria: Math.round(valorDiaria * 100),
        valorServico: valorCalculado > 0 ? Math.round(valorCalculado * 100) : undefined,
        descricaoServico,
        observacoes,
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...input });
      } else {
        await createMutation.mutateAsync(input);
      }

      // Limpar o formulário
      diaristaRef.current!.value = "";
      especialidadeRef.current!.value = "";
      enderecoRef.current!.value = "";
      dataInicioRef.current!.value = "";
      dataFimRef.current!.value = "";
      valorDiariaRef.current!.value = "";
      descricaoRef.current!.value = "";
      observacoesRef.current!.value = "";
      setErrors({});

      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      setErrors({ submit: "Erro ao salvar agendamento. Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  }, [editingId, createMutation, updateMutation, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Diarista */}
      <div>
        <Label htmlFor="diarista">Diarista *</Label>
        <select
          ref={diaristaRef}
          id="diarista"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione uma diarista</option>
          {diaristas.map(d => (
            <option key={d.id} value={d.id.toString()}>
              {d.nome}
            </option>
          ))}
        </select>
        {errors.diaristaId && <p className="text-red-500 text-sm mt-1">{errors.diaristaId}</p>}
      </div>

      {/* Especialidade */}
      <div>
        <Label htmlFor="especialidade">Especialidade *</Label>
        <select
          ref={especialidadeRef}
          id="especialidade"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione uma especialidade</option>
          {especialidades.map(e => (
            <option key={e.id} value={e.id.toString()}>
              {e.nome}
            </option>
          ))}
        </select>
        {errors.especialidadeId && <p className="text-red-500 text-sm mt-1">{errors.especialidadeId}</p>}
      </div>

      {/* Local de Serviço */}
      <div>
        <Label htmlFor="endereco">📍 Local de Serviço (Operação) *</Label>
        <select
          ref={enderecoRef}
          id="endereco"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione o local</option>
          {ENDERECOS.map(endereco => (
            <option key={endereco} value={endereco}>
              {endereco}
            </option>
          ))}
        </select>
        {errors.enderecoServico && <p className="text-red-500 text-sm mt-1">{errors.enderecoServico}</p>}
      </div>

      {/* Datas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dataInicio">Data de Início *</Label>
          <input
            ref={dataInicioRef}
            type="date"
            id="dataInicio"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.dataInicio && <p className="text-red-500 text-sm mt-1">{errors.dataInicio}</p>}
        </div>
        <div>
          <Label htmlFor="dataFim">Data de Fim *</Label>
          <input
            ref={dataFimRef}
            type="date"
            id="dataFim"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.dataFim && <p className="text-red-500 text-sm mt-1">{errors.dataFim}</p>}
        </div>
      </div>

      {/* Valor da Diária */}
      <div>
        <Label htmlFor="valorDiaria">💵 Valor da Diária (R$) *</Label>
        <input
          ref={valorDiariaRef}
          type="number"
          id="valorDiaria"
          placeholder="Ex: 150.00"
          step="0.01"
          min="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.valorDiaria && <p className="text-red-500 text-sm mt-1">{errors.valorDiaria}</p>}
      </div>

      {/* Valor Total */}
      <div className="bg-green-50 p-3 rounded-md">
        <p className="text-green-700 font-semibold">
          💰 Valor Total: R$ {calcularValorTotal().toFixed(2)}
        </p>
      </div>

      {/* Descrição */}
      <div>
        <Label htmlFor="descricao">Descrição do Serviço</Label>
        <Textarea
          ref={descricaoRef}
          id="descricao"
          placeholder="Descreva o serviço a ser realizado"
          className="min-h-24"
        />
      </div>

      {/* Observações */}
      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          ref={observacoesRef}
          id="observacoes"
          placeholder="Observações adicionais"
          className="min-h-24"
        />
      </div>

      {/* Erro de submissão */}
      {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

      {/* Botões */}
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Agendando..." : "Agendar"}
        </Button>
      </div>
    </form>
  );
}


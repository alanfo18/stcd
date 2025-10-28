import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { notifyCoordinatorNewScheduling, notifyDiaristaNewScheduling, notifyPaymentMade } from "./whatsapp";
import {
  createDiarista,
  getDiaristasForUser,
  getDiaristaById,
  updateDiarista,
  deleteDiarista,
  getEspecialidades,
  getEspecialidadeById,
  createEspecialidade,
  addEspecialidadeToDiarista,
  getDiaristaEspecialidades,
  removeEspecialidadeFromDiarista,
  createAgendamento,
  getAgendamentosForUser,
  getAgendamentoById,
  updateAgendamento,
  deleteAgendamento,
  createPagamento,
  getPagamentosForUser,
  getPagamentoById,
  updatePagamento,
  createAvaliacao,
  getAvaliacoesDiarista,
  getMediaAvaliacoesDiarista,
  updateAvaliacao,
  getPagamentosForDiarista,
  getAgendamentosForDiarista,
  getAgendamentosWithEspecialidade,
  getAgendamentosWithEspecialidadeAll,
  getAllUsers,
  updateUserRole,
  getUserById,
  obterNotificacoes,
  obterNotificacoesNaoLidas,
  marcarNotificacaoComoLida,
  marcarTodasNotificacoesComoLidas,
  deletarNotificacao,
} from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ========== DIARISTA ROUTERS ==========

  diarista: router({
    create: protectedProcedure
      .input(z.object({
        nome: z.string().min(1),
        telefone: z.string().min(1),
        email: z.union([z.string().email(), z.literal('')]).optional(),
        endereco: z.union([z.string(), z.literal('')]).optional(),
        cidade: z.union([z.string(), z.literal('')]).optional(),
        cep: z.union([z.string(), z.literal('')]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await createDiarista({
            userId: ctx.user.id,
            nome: input.nome,
            telefone: input.telefone,
            email: input.email || undefined,
            endereco: input.endereco || undefined,
            cidade: input.cidade || undefined,
            cep: input.cep || undefined,
          });
        } catch (error) {
          console.error('[Diarista Create Error]', error);
          throw error;
        }
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        return getDiaristasForUser(ctx.user.id);
      }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return getDiaristaById(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        telefone: z.string().optional(),
        email: z.union([z.string().email(), z.literal('')]).optional(),
        endereco: z.union([z.string(), z.literal('')]).optional(),
        cidade: z.union([z.string(), z.literal('')]).optional(),
        cep: z.union([z.string(), z.literal('')]).optional(),
        ativa: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateDiarista(id, data);
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        return deleteDiarista(input);
      }),
  }),

  // ========== ESPECIALIDADE ROUTERS ==========

  especialidade: router({
    list: publicProcedure
      .query(async () => {
        return getEspecialidades();
      }),

    create: protectedProcedure
      .input(z.object({
        nome: z.string().min(1),
        descricao: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return createEspecialidade({
          nome: input.nome,
          descricao: input.descricao,
        });
      }),
  }),

  // ========== DIARISTA ESPECIALIDADE ROUTERS ==========

  diaristaEspecialidade: router({
    add: protectedProcedure
      .input(z.object({
        diaristaId: z.number(),
        especialidadeId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return addEspecialidadeToDiarista(input);
      }),

    getForDiarista: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return getDiaristaEspecialidades(input);
      }),

    remove: protectedProcedure
      .input(z.object({
        diaristaId: z.number(),
        especialidadeId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return removeEspecialidadeFromDiarista(input.diaristaId, input.especialidadeId);
      }),
  }),

  // ========== AGENDAMENTO ROUTERS ==========

  agendamento: router({
    create: protectedProcedure
      .input(z.object({
        diaristaId: z.number(),
        especialidadeId: z.number(),
        enderecoServico: z.string().min(1),
        dataInicio: z.date(),
        dataFim: z.date(),
        valorDiaria: z.number().int().min(0),
        descricaoServico: z.string().optional(),
        valorServico: z.number().int().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const agendamento = await createAgendamento({
          userId: ctx.user.id,
          diaristaId: input.diaristaId,
          especialidadeId: input.especialidadeId,
          enderecoServico: input.enderecoServico,
          dataInicio: input.dataInicio,
          dataFim: input.dataFim,
          descricaoServico: input.descricaoServico,
          valorDiaria: input.valorDiaria,
          valorServico: input.valorServico,
          observacoes: input.observacoes,
        });
        const diarista = await getDiaristaById(input.diaristaId);
        if (diarista && input.valorServico) {
          const dataInicio = new Date(input.dataInicio).toLocaleDateString('pt-BR');
          const dataFim = new Date(input.dataFim).toLocaleDateString('pt-BR');
          const amount = (input.valorServico / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          const especialidade = await getEspecialidadeById(input.especialidadeId);
          const especialidadeName = especialidade?.nome || 'Servico';
          
          await notifyCoordinatorNewScheduling(diarista.nome, especialidadeName, input.enderecoServico, dataInicio, dataFim, amount);
          await notifyDiaristaNewScheduling(diarista.telefone, especialidadeName, input.enderecoServico, dataInicio, dataFim, amount, input.descricaoServico);
        }
        return agendamento;
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        // Admins veem todos os agendamentos, usuários normais veem apenas os seus
        if (ctx.user.role === 'admin') {
          return getAgendamentosWithEspecialidadeAll();
        }
        return getAgendamentosWithEspecialidade(ctx.user.id);
      }),

    listForDiarista: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return getAgendamentosForDiarista(input);
      }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return getAgendamentoById(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["agendado", "concluido", "cancelado"]).optional(),
        nomeCliente: z.string().optional(),
        telefoneCliente: z.string().optional(),
        enderecoServico: z.string().optional(),
        dataServico: z.date().optional(),
        horaInicio: z.string().optional(),
        horaFim: z.string().optional(),
        horaDescansoInicio: z.string().optional(),
        horaDescansoFim: z.string().optional(),
        descricaoServico: z.string().optional(),
        valorServico: z.number().int().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateAgendamento(id, data);
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        return deleteAgendamento(input);
      }),
  }),

  // ========== PAGAMENTO ROUTERS ==========

  pagamento: router({
    create: protectedProcedure
      .input(z.object({
        diaristaId: z.number(),
        agendamentoId: z.number().optional(),
        valor: z.number().int().min(0),
        dataPagamento: z.date(),
        metodo: z.enum(["dinheiro", "pix", "transferencia", "cartao"]),
        status: z.enum(["pendente", "pago", "cancelado"]).optional(),
        descricao: z.string().optional(),
        comprovante: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const pagamento = await createPagamento({
          userId: ctx.user.id,
          diaristaId: input.diaristaId,
          agendamentoId: input.agendamentoId,
          valor: input.valor,
          dataPagamento: input.dataPagamento,
          metodo: input.metodo,
          status: input.status || "pendente",
          descricao: input.descricao,
          comprovante: input.comprovante,
        });
        const diarista = await getDiaristaById(input.diaristaId);
        if (diarista && (input.status === "pago" || input.status === undefined)) {
          const valorFormatado = (input.valor / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          const dataFormatada = new Date(input.dataPagamento).toLocaleDateString('pt-BR');
          const metodoLabel = { dinheiro: 'Dinheiro', pix: 'PIX', transferencia: 'Transferencia', cartao: 'Cartao' }[input.metodo];
          await notifyPaymentMade(diarista.nome, diarista.telefone, valorFormatado, metodoLabel, dataFormatada);
        }
        return pagamento;
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        return getPagamentosForUser(ctx.user.id);
      }),

    listForDiarista: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return getPagamentosForDiarista(input);
      }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return getPagamentoById(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        valor: z.number().int().optional(),
        dataPagamento: z.date().optional(),
        metodo: z.enum(["dinheiro", "pix", "transferencia", "cartao"]).optional(),
        status: z.enum(["pendente", "pago", "cancelado"]).optional(),
        descricao: z.string().optional(),
        comprovante: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updatePagamento(id, data);
      }),
  }),

  // ========== AVALIACAO ROUTERS ==========

  avaliacao: router({
    create: protectedProcedure
      .input(z.object({
        diaristaId: z.number(),
        agendamentoId: z.number(),
        nota: z.number().int().min(1).max(5),
        comentario: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createAvaliacao({
          userId: ctx.user.id,
          diaristaId: input.diaristaId,
          agendamentoId: input.agendamentoId,
          nota: input.nota,
          comentario: input.comentario,
        });
      }),

    listForDiarista: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return getAvaliacoesDiarista(input);
      }),

    getMediaForDiarista: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const media = await getMediaAvaliacoesDiarista(input);
        return { media };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nota: z.number().int().min(1).max(5).optional(),
        comentario: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateAvaliacao(id, data);
      }),
  }),

  // ========== USER MANAGEMENT ROUTERS ==========
  user: router({
    listAll: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized: Only admins can list all users');
        }
        return getAllUsers();
      }),
    
    updateRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(['user', 'admin']),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized: Only admins can update user roles');
        }
        return updateUserRole(input.userId, input.role);
      }),
  }),
  
  // ============================================
  // NOTIFICAÇÕES
  // ============================================
  notificacao: router({
    list: protectedProcedure
      .input(z.object({ limite: z.number().default(10) }))
      .query(async ({ input, ctx }) => {
        return obterNotificacoes(ctx.user.id, input.limite);
      }),
    
    naoLidas: protectedProcedure
      .query(async ({ ctx }) => {
        return obterNotificacoesNaoLidas(ctx.user.id);
      }),
    
    marcarComoLida: protectedProcedure
      .input(z.object({ notificacaoId: z.number() }))
      .mutation(async ({ input }) => {
        return marcarNotificacaoComoLida(input.notificacaoId);
      }),
    
    marcarTodasComoLidas: protectedProcedure
      .mutation(async ({ ctx }) => {
        return marcarTodasNotificacoesComoLidas(ctx.user.id);
      }),
    
    deletar: protectedProcedure
      .input(z.object({ notificacaoId: z.number() }))
      .mutation(async ({ input }) => {
        return deletarNotificacao(input.notificacaoId);
      }),
  }),
});

export type AppRouter = typeof appRouter;


// Nota: O router de user management foi adicionado acima, antes do fechamento do appRouter

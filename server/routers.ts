import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createDiarista,
  getDiaristasForUser,
  getDiaristaById,
  updateDiarista,
  deleteDiarista,
  getEspecialidades,
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
        email: z.string().email().optional(),
        endereco: z.string().optional(),
        cidade: z.string().optional(),
        cep: z.string().optional(),
        valorDiaria: z.number().int().min(0),
      }))
      .mutation(async ({ ctx, input }) => {
        return createDiarista({
          userId: ctx.user.id,
          nome: input.nome,
          telefone: input.telefone,
          email: input.email,
          endereco: input.endereco,
          cidade: input.cidade,
          cep: input.cep,
          valorDiaria: input.valorDiaria,
        });
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
        email: z.string().email().optional(),
        endereco: z.string().optional(),
        cidade: z.string().optional(),
        cep: z.string().optional(),
        valorDiaria: z.number().int().optional(),
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
        nomeCliente: z.string().min(1),
        telefoneCliente: z.string().optional(),
        enderecoServico: z.string().min(1),
        dataServico: z.date(),
        horaInicio: z.string().optional(),
        horaFim: z.string().optional(),
        descricaoServico: z.string().optional(),
        valorServico: z.number().int().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createAgendamento({
          userId: ctx.user.id,
          diaristaId: input.diaristaId,
          especialidadeId: input.especialidadeId,
          nomeCliente: input.nomeCliente,
          telefoneCliente: input.telefoneCliente,
          enderecoServico: input.enderecoServico,
          dataServico: input.dataServico,
          horaInicio: input.horaInicio,
          horaFim: input.horaFim,
          descricaoServico: input.descricaoServico,
          valorServico: input.valorServico,
          observacoes: input.observacoes,
        });
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        return getAgendamentosForUser(ctx.user.id);
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
        return createPagamento({
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
});

export type AppRouter = typeof appRouter;


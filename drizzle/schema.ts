import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de Diaristas
 * Armazena informações sobre as diaristas cadastradas no sistema
 */
export const diaristas = mysqlTable("diaristas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Referência ao usuário que criou/gerencia
  nome: varchar("nome", { length: 255 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }),
  endereco: text("endereco"),
  cidade: varchar("cidade", { length: 100 }),
  cep: varchar("cep", { length: 10 }),
  ativa: boolean("ativa").default(true).notNull(),
  dataContratacao: timestamp("dataContratacao").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Diarista = typeof diaristas.$inferSelect;
export type InsertDiarista = typeof diaristas.$inferInsert;

// Função auxiliar para formatar valores em BRL
export function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função auxiliar para converter BRL para centavos
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9,.-]/g, '').replace(',', '.');
  return Math.round(parseFloat(cleaned) * 100);
}

/**
 * Tabela de Especialidades
 * Define os tipos de serviços que as diaristas podem oferecer
 */
export const especialidades = mysqlTable("especialidades", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull().unique(),
  descricao: text("descricao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Especialidade = typeof especialidades.$inferSelect;
export type InsertEspecialidade = typeof especialidades.$inferInsert;

/**
 * Tabela de Relacionamento: Diarista x Especialidade
 * Define quais especialidades cada diarista oferece
 */
export const diaristasEspecialidades = mysqlTable("diaristas_especialidades", {
  id: int("id").autoincrement().primaryKey(),
  diaristaId: int("diaristaId").notNull(),
  especialidadeId: int("especialidadeId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DiaristaEspecialidade = typeof diaristasEspecialidades.$inferSelect;
export type InsertDiaristaEspecialidade = typeof diaristasEspecialidades.$inferInsert;

/**
 * Tabela de Agendamentos
 * Registra os serviços agendados para as diaristas
 */
export const agendamentos = mysqlTable("agendamentos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Usuário que criou o agendamento
  diaristaId: int("diaristaId").notNull(),
  especialidadeId: int("especialidadeId").notNull(),
  nomeCliente: varchar("nomeCliente", { length: 255 }).notNull(),
  telefoneCliente: varchar("telefoneCliente", { length: 20 }),
  enderecoServico: text("enderecoServico").notNull(),
  dataInicio: timestamp("dataInicio").notNull(),
  dataFim: timestamp("dataFim").notNull(),
  descricaoServico: text("descricaoServico"),
  status: mysqlEnum("status", ["agendado", "concluido", "cancelado"]).default("agendado").notNull(),
  valorDiaria: int("valorDiaria").notNull(), // Valor da diária em centavos para este agendamento
  valorServico: int("valorServico"), // Valor total calculado (dias × diária)
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agendamento = typeof agendamentos.$inferSelect;
export type InsertAgendamento = typeof agendamentos.$inferInsert;

/**
 * Tabela de Pagamentos
 * Registra os pagamentos realizados às diaristas
 */
export const pagamentos = mysqlTable("pagamentos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Usuário que registrou o pagamento
  diaristaId: int("diaristaId").notNull(),
  agendamentoId: int("agendamentoId"), // Referência ao agendamento (opcional)
  valor: int("valor").notNull(), // Valor em centavos
  dataPagamento: timestamp("dataPagamento").notNull(),
  metodo: mysqlEnum("metodo", ["dinheiro", "pix", "transferencia", "cartao"]).notNull(),
  status: mysqlEnum("status", ["pendente", "pago", "cancelado"]).default("pendente").notNull(),
  descricao: text("descricao"),
  comprovante: varchar("comprovante", { length: 255 }), // URL ou caminho do comprovante
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Pagamento = typeof pagamentos.$inferSelect;
export type InsertPagamento = typeof pagamentos.$inferInsert;

/**
 * Tabela de Avaliações
 * Permite avaliar o trabalho das diaristas
 */
export const avaliacoes = mysqlTable("avaliacoes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Usuário que fez a avaliação
  diaristaId: int("diaristaId").notNull(),
  agendamentoId: int("agendamentoId").notNull(),
  nota: int("nota").notNull(), // 1-5 estrelas
  comentario: text("comentario"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Avaliacao = typeof avaliacoes.$inferSelect;
export type InsertAvaliacao = typeof avaliacoes.$inferInsert;

/**
 * Tabela de Comprovantes
 * Armazena URLs de comprovantes de pagamento (imagens e PDFs)
 */
export const comprovantes = mysqlTable("comprovantes", {
  id: int("id").autoincrement().primaryKey(),
  pagamentoId: int("pagamentoId").notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  tipoArquivo: varchar("tipoArquivo", { length: 50 }).notNull(), // image/png, application/pdf, etc
  nomeArquivo: varchar("nomeArquivo", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Comprovante = typeof comprovantes.$inferSelect;
export type InsertComprovante = typeof comprovantes.$inferInsert;

/**
 * Tabela de Recibos
 * Armazena recibos assinados para diaristas
 */
export const recibos = mysqlTable("recibos", {
  id: int("id").autoincrement().primaryKey(),
  agendamentoId: int("agendamentoId").notNull(),
  pagamentoId: int("pagamentoId").notNull(),
  diaristaId: int("diaristaId").notNull(),
  urlPdf: varchar("urlPdf", { length: 500 }).notNull(),
  assinado: boolean("assinado").default(false).notNull(),
  dataAssinatura: timestamp("dataAssinatura"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Recibo = typeof recibos.$inferSelect;
export type InsertRecibo = typeof recibos.$inferInsert;

/**
 * Tabela de Notificações WhatsApp
 * Registra notificações enviadas via WhatsApp
 */
export const notificacoesWhatsapp = mysqlTable("notificacoes_whatsapp", {
  id: int("id").autoincrement().primaryKey(),
  agendamentoId: int("agendamentoId"),
  pagamentoId: int("pagamentoId"),
  diaristaId: int("diaristaId"),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  tipo: mysqlEnum("tipo", ["agendamento", "pagamento", "recibo", "aviso"]).notNull(),
  mensagem: text("mensagem").notNull(),
  status: mysqlEnum("status", ["pendente", "enviado", "falha"]).default("pendente").notNull(),
  dataEnvio: timestamp("dataEnvio"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NotificacaoWhatsapp = typeof notificacoesWhatsapp.$inferSelect;
export type InsertNotificacaoWhatsapp = typeof notificacoesWhatsapp.$inferInsert;


import { eq, and, gte, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  diaristas, 
  InsertDiarista,
  especialidades,
  InsertEspecialidade,
  diaristasEspecialidades,
  InsertDiaristaEspecialidade,
  agendamentos,
  InsertAgendamento,
  pagamentos,
  InsertPagamento,
  avaliacoes,
  InsertAvaliacao,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ========== USER OPERATIONS ==========

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== DIARISTA OPERATIONS ==========

export async function createDiarista(data: InsertDiarista) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (!data.userId) throw new Error("userId is required");
  if (!data.nome) throw new Error("nome is required");
  if (!data.telefone) throw new Error("telefone is required");
  
  try {
    await db.insert(diaristas).values({
      userId: data.userId,
      nome: data.nome,
      telefone: data.telefone,
      email: data.email || null,
      endereco: data.endereco || null,
      cidade: data.cidade || null,
      cep: data.cep || null,
      ativa: data.ativa ?? true,
    });
    
    return { success: true, message: "Diarista criada com sucesso" };
  } catch (error) {
    console.error('[createDiarista Error]', error);
    throw new Error(`Erro ao criar diarista: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
  }
}

export async function getDiaristasForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(diaristas).where(eq(diaristas.userId, userId));
}

export async function getDiaristaById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(diaristas).where(eq(diaristas.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateDiarista(id: number, data: Partial<InsertDiarista>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(diaristas).set(data).where(eq(diaristas.id, id));
}

export async function deleteDiarista(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(diaristas).where(eq(diaristas.id, id));
}

// ========== ESPECIALIDADE OPERATIONS ==========

export async function createEspecialidade(data: InsertEspecialidade) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(especialidades).values(data);
}

export async function getEspecialidades() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(especialidades);
}

export async function getEspecialidadeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(especialidades).where(eq(especialidades.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ========== DIARISTA ESPECIALIDADE OPERATIONS ==========

export async function addEspecialidadeToDiarista(data: InsertDiaristaEspecialidade) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(diaristasEspecialidades).values(data);
}

export async function getDiaristaEspecialidades(diaristaId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(diaristasEspecialidades).where(eq(diaristasEspecialidades.diaristaId, diaristaId));
}

export async function removeEspecialidadeFromDiarista(diaristaId: number, especialidadeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(diaristasEspecialidades).where(
    and(
      eq(diaristasEspecialidades.diaristaId, diaristaId),
      eq(diaristasEspecialidades.especialidadeId, especialidadeId)
    )
  );
}

// ========== AGENDAMENTO OPERATIONS ==========

export async function createAgendamento(data: InsertAgendamento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(agendamentos).values(data);
}

export async function getAgendamentosForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(agendamentos)
    .where(eq(agendamentos.userId, userId))
    .orderBy(desc(agendamentos.dataInicio));
}

export async function getAgendamentosForDiarista(diaristaId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(agendamentos)
    .where(eq(agendamentos.diaristaId, diaristaId))
    .orderBy(desc(agendamentos.dataInicio));
}

export async function getAgendamentoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(agendamentos).where(eq(agendamentos.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateAgendamento(id: number, data: Partial<InsertAgendamento>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(agendamentos).set(data).where(eq(agendamentos.id, id));
}

export async function deleteAgendamento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(agendamentos).where(eq(agendamentos.id, id));
}

// ========== PAGAMENTO OPERATIONS ==========

export async function createPagamento(data: InsertPagamento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(pagamentos).values(data);
}

export async function getPagamentosForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(pagamentos)
    .where(eq(pagamentos.userId, userId))
    .orderBy(desc(pagamentos.dataPagamento));
}

export async function getPagamentosForDiarista(diaristaId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(pagamentos)
    .where(eq(pagamentos.diaristaId, diaristaId))
    .orderBy(desc(pagamentos.dataPagamento));
}

export async function getPagamentoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(pagamentos).where(eq(pagamentos.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updatePagamento(id: number, data: Partial<InsertPagamento>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(pagamentos).set(data).where(eq(pagamentos.id, id));
}

// ========== AVALIACAO OPERATIONS ==========

export async function createAvaliacao(data: InsertAvaliacao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(avaliacoes).values(data);
}

export async function getAvaliacoesDiarista(diaristaId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(avaliacoes)
    .where(eq(avaliacoes.diaristaId, diaristaId))
    .orderBy(desc(avaliacoes.createdAt));
}

export async function getMediaAvaliacoesDiarista(diaristaId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const avaliacoes_list = await getAvaliacoesDiarista(diaristaId);
  if (avaliacoes_list.length === 0) return 0;
  
  const soma = avaliacoes_list.reduce((acc, av) => acc + av.nota, 0);
  return soma / avaliacoes_list.length;
}

export async function updateAvaliacao(id: number, data: Partial<InsertAvaliacao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(avaliacoes).set(data).where(eq(avaliacoes.id, id));
}


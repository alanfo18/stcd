import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
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
import { eq, and, desc } from "drizzle-orm";

let _db: any = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Parse DATABASE_URL
      const url = new URL(process.env.DATABASE_URL);
      
      // Create MySQL2 pool with proper SSL configuration
      const pool = mysql.createPool({
        host: url.hostname,
        port: parseInt(url.port || '3306'),
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
        ssl: { rejectUnauthorized: false },  // Enable SSL with certificate validation disabled
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      console.log('[Database] Initializing connection...');
      _db = drizzle(pool);
      console.log("[Database] Connected successfully");
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
    console.error("[Database] Error upserting user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string): Promise<any> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return null;
  }

  try {
    const result = await db.select().from(users).where(eq(users.openId, openId));
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting user:", error);
    return null;
  }
}

// ========== DIARISTA OPERATIONS ==========

export async function createDiarista(diarista: InsertDiarista): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create diarista: database not available");
    return;
  }

  try {
    await db.insert(diaristas).values(diarista);
  } catch (error) {
    console.error("[Database] Error creating diarista:", error);
    throw error;
  }
}

export async function getDiaristas(): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get diaristas: database not available");
    return [];
  }

  try {
    return await db.select().from(diaristas);
  } catch (error) {
    console.error("[Database] Error getting diaristas:", error);
    return [];
  }
}

export async function getDiaristaById(id: number): Promise<any> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get diarista: database not available");
    return null;
  }

  try {
    const result = await db.select().from(diaristas).where(eq(diaristas.id, id));
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting diarista:", error);
    return null;
  }
}

export async function getDiaristasForUser(userId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get diaristas: database not available");
    return [];
  }

  try {
    return await db.select().from(diaristas);
  } catch (error) {
    console.error("[Database] Error getting diaristas:", error);
    return [];
  }
}

export async function updateDiarista(id: number, updates: Partial<InsertDiarista>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update diarista: database not available");
    return;
  }

  try {
    await db.update(diaristas).set(updates).where(eq(diaristas.id, id));
  } catch (error) {
    console.error("[Database] Error updating diarista:", error);
    throw error;
  }
}

export async function deleteDiarista(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete diarista: database not available");
    return;
  }

  try {
    await db.delete(diaristas).where(eq(diaristas.id, id));
  } catch (error) {
    console.error("[Database] Error deleting diarista:", error);
    throw error;
  }
}

// ========== ESPECIALIDADE OPERATIONS ==========

export async function createEspecialidade(especialidade: InsertEspecialidade): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create especialidade: database not available");
    return;
  }

  try {
    await db.insert(especialidades).values(especialidade);
  } catch (error) {
    console.error("[Database] Error creating especialidade:", error);
    throw error;
  }
}

export async function getEspecialidades(): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get especialidades: database not available");
    return [];
  }

  try {
    return await db.select().from(especialidades);
  } catch (error) {
    console.error("[Database] Error getting especialidades:", error);
    return [];
  }
}

export async function getEspecialidadeById(id: number): Promise<any> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get especialidade: database not available");
    return null;
  }

  try {
    const result = await db.select().from(especialidades).where(eq(especialidades.id, id));
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting especialidade:", error);
    return null;
  }
}

// ========== DIARISTA ESPECIALIDADE OPERATIONS ==========

export async function addEspecialidadeToDiarista(diaristaEspecialidade: InsertDiaristaEspecialidade): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add especialidade to diarista: database not available");
    return;
  }

  try {
    await db.insert(diaristasEspecialidades).values(diaristaEspecialidade);
  } catch (error) {
    console.error("[Database] Error adding especialidade to diarista:", error);
    throw error;
  }
}

export async function getDiaristaEspecialidades(diaristaId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get diarista especialidades: database not available");
    return [];
  }

  try {
    return await db.select().from(diaristasEspecialidades).where(eq(diaristasEspecialidades.diaristaId, diaristaId));
  } catch (error) {
    console.error("[Database] Error getting diarista especialidades:", error);
    return [];
  }
}

export async function removeEspecialidadeFromDiarista(diaristaId: number, especialidadeId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot remove especialidade from diarista: database not available");
    return;
  }

  try {
    await db.delete(diaristasEspecialidades)
      .where(and(
        eq(diaristasEspecialidades.diaristaId, diaristaId),
        eq(diaristasEspecialidades.especialidadeId, especialidadeId)
      ));
  } catch (error) {
    console.error("[Database] Error removing especialidade from diarista:", error);
    throw error;
  }
}

// ========== AGENDAMENTO OPERATIONS ==========

export async function createAgendamento(agendamento: InsertAgendamento): Promise<any> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create agendamento: database not available");
    return null;
  }

  try {
    await db.insert(agendamentos).values(agendamento);
    // Retornar o agendamento inserido
    return agendamento;
  } catch (error) {
    console.error("[Database] Error creating agendamento:", error);
    throw error;
  }
}

export async function getAgendamentosForUser(userId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get agendamentos: database not available");
    return [];
  }

  try {
    return await db.select().from(agendamentos).where(eq(agendamentos.userId, userId)).orderBy(desc(agendamentos.dataInicio));
  } catch (error) {
    console.error("[Database] Error getting agendamentos:", error);
    return [];
  }
}

export async function getAgendamentosForDiarista(diaristaId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get agendamentos: database not available");
    return [];
  }

  try {
    return await db.select().from(agendamentos).where(eq(agendamentos.diaristaId, diaristaId)).orderBy(desc(agendamentos.dataInicio));
  } catch (error) {
    console.error("[Database] Error getting agendamentos:", error);
    return [];
  }
}

export async function getAgendamentoById(id: number): Promise<any> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get agendamento: database not available");
    return null;
  }

  try {
    const result = await db.select().from(agendamentos).where(eq(agendamentos.id, id));
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting agendamento:", error);
    return null;
  }
}

export async function updateAgendamento(id: number, updates: Partial<InsertAgendamento>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update agendamento: database not available");
    return;
  }

  try {
    await db.update(agendamentos).set(updates).where(eq(agendamentos.id, id));
  } catch (error) {
    console.error("[Database] Error updating agendamento:", error);
    throw error;
  }
}

export async function deleteAgendamento(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete agendamento: database not available");
    return;
  }

  try {
    await db.delete(agendamentos).where(eq(agendamentos.id, id));
  } catch (error) {
    console.error("[Database] Error deleting agendamento:", error);
    throw error;
  }
}

// ========== PAGAMENTO OPERATIONS ==========

export async function createPagamento(pagamento: InsertPagamento): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create pagamento: database not available");
    return;
  }

  try {
    await db.insert(pagamentos).values(pagamento);
  } catch (error) {
    console.error("[Database] Error creating pagamento:", error);
    throw error;
  }
}

export async function getPagamentosForUser(userId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get pagamentos: database not available");
    return [];
  }

  try {
    return await db.select().from(pagamentos).where(eq(pagamentos.userId, userId)).orderBy(desc(pagamentos.createdAt));
  } catch (error) {
    console.error("[Database] Error getting pagamentos:", error);
    return [];
  }
}

export async function getPagamentosForDiarista(diaristaId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get pagamentos: database not available");
    return [];
  }

  try {
    return await db.select().from(pagamentos).where(eq(pagamentos.diaristaId, diaristaId)).orderBy(desc(pagamentos.createdAt));
  } catch (error) {
    console.error("[Database] Error getting pagamentos:", error);
    return [];
  }
}

export async function getPagamentoById(id: number): Promise<any> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get pagamento: database not available");
    return null;
  }

  try {
    const result = await db.select().from(pagamentos).where(eq(pagamentos.id, id));
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting pagamento:", error);
    return null;
  }
}

export async function updatePagamento(id: number, updates: Partial<InsertPagamento>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update pagamento: database not available");
    return;
  }

  try {
    await db.update(pagamentos).set(updates).where(eq(pagamentos.id, id));
  } catch (error) {
    console.error("[Database] Error updating pagamento:", error);
    throw error;
  }
}

// ========== AVALIACAO OPERATIONS ==========

export async function createAvaliacao(avaliacao: InsertAvaliacao): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create avaliacao: database not available");
    return;
  }

  try {
    await db.insert(avaliacoes).values(avaliacao);
  } catch (error) {
    console.error("[Database] Error creating avaliacao:", error);
    throw error;
  }
}

export async function getAvaliacoesDiarista(diaristaId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get avaliacoes: database not available");
    return [];
  }

  try {
    return await db.select().from(avaliacoes).where(eq(avaliacoes.diaristaId, diaristaId)).orderBy(desc(avaliacoes.createdAt));
  } catch (error) {
    console.error("[Database] Error getting avaliacoes:", error);
    return [];
  }
}

export async function getMediaAvaliacoesDiarista(diaristaId: number): Promise<number> {
  const avaliacoesList = await getAvaliacoesDiarista(diaristaId);
  if (avaliacoesList.length === 0) return 0;
  
  const soma = avaliacoesList.reduce((acc, av) => acc + (av.nota || 0), 0);
  return soma / avaliacoesList.length;
}

export async function updateAvaliacao(id: number, updates: Partial<InsertAvaliacao>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update avaliacao: database not available");
    return;
  }

  try {
    await db.update(avaliacoes).set(updates).where(eq(avaliacoes.id, id));
  } catch (error) {
    console.error("[Database] Error updating avaliacao:", error);
    throw error;
  }
}



// ========== AGENDAMENTOS COM ESPECIALIDADE ==========

export async function getAgendamentosWithEspecialidade(userId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get agendamentos: database not available");
    return [];
  }

  try {
    const result = await db.select().from(agendamentos).where(eq(agendamentos.userId, userId)).orderBy(desc(agendamentos.dataInicio));
    
    // Enriquecer com dados de especialidade
    const enriched = await Promise.all(
      result.map(async (agendamento: any) => {
        const especialidade = await getEspecialidadeById(agendamento.especialidadeId);
        return {
          ...agendamento,
          especialidade: especialidade?.nome || null,
        };
      })
    );
    
    return enriched;
  } catch (error) {
    console.error("[Database] Error getting agendamentos with especialidade:", error);
    return [];
  }
}

export async function getAgendamentosWithEspecialidadeAll(): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get agendamentos: database not available");
    return [];
  }

  try {
    const result = await db.select().from(agendamentos).orderBy(desc(agendamentos.dataInicio));
    
    // Enriquecer com dados de especialidade
    const enriched = await Promise.all(
      result.map(async (agendamento: any) => {
        const especialidade = await getEspecialidadeById(agendamento.especialidadeId);
        return {
          ...agendamento,
          especialidade: especialidade?.nome || null,
        };
      })
    );
    
    return enriched;
  } catch (error) {
    console.error("[Database] Error getting all agendamentos with especialidade:", error);
    return [];
  }
}


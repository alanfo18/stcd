import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Usuarios() {
  const [, setLocation] = useLocation();
  const { data: usuarios = [], isLoading, refetch } = trpc.user.listAll.useQuery();
  const updateRoleMutation = trpc.user.updateRole.useMutation();

  const handlePromoteToAdmin = async (userId: number) => {
    if (confirm("Tem certeza que deseja promover este usuário a admin?")) {
      try {
        await updateRoleMutation.mutateAsync({
          userId,
          role: "admin",
        });
        refetch();
      } catch (error) {
        console.error("Erro ao promover usuário:", error);
        alert("Erro ao promover usuário");
      }
    }
  };

  const handleDemoteFromAdmin = async (userId: number) => {
    if (confirm("Tem certeza que deseja remover permissão de admin deste usuário?")) {
      try {
        await updateRoleMutation.mutateAsync({
          userId,
          role: "user",
        });
        refetch();
      } catch (error) {
        console.error("Erro ao remover permissão:", error);
        alert("Erro ao remover permissão");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👥 Gerenciamento de Usuários</h1>
            <p className="text-gray-600 mt-1">Gerencie permissões e roles dos supervisores</p>
          </div>
          <Button onClick={() => setLocation("/")} variant="outline" className="mr-2">
            ← Voltar
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Carregando usuários...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {usuarios.map((usuario: any) => (
              <Card key={usuario.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{usuario.name || "—"}</CardTitle>
                      <CardDescription>{usuario.email || "—"}</CardDescription>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          usuario.role === "admin"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {usuario.role === "admin" ? "👑 Admin" : "👤 Supervisor"}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">ID:</span>
                      <p className="font-semibold">{usuario.id}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Último Login:</span>
                      <p className="font-semibold text-sm">
                        {new Date(usuario.lastSignedIn).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Cadastrado em:</span>
                      <p className="font-semibold text-sm">
                        {new Date(usuario.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    {usuario.role === "admin" ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleDemoteFromAdmin(usuario.id)}
                      >
                        ⬇️ Remover Admin
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handlePromoteToAdmin(usuario.id)}
                      >
                        ⬆️ Promover a Admin
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Informações sobre permissões */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">ℹ️ Sobre Permissões</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 space-y-2">
            <p>
              <strong>Admin:</strong> Pode ver todos os diaristas, agendamentos e pagamentos. Pode gerenciar
              permissões de outros usuários.
            </p>
            <p>
              <strong>Supervisor:</strong> Pode ver apenas seus próprios dados e criar novos registros.
            </p>
            <p className="text-sm text-blue-700 mt-4">
              💡 Recomendação: Promova todos os supervisores (Nunes, Tsuru, Jennifer, Barbara, Joubert,
              César, Trindade) a admin para que tenham acesso ao banco de dados unificado.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


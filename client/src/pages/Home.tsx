import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <img src="/logo-067vinhos.png" alt="067 Vinhos" className="h-20 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-white">{APP_TITLE}</h1>
            <p className="text-gray-300 mt-2">Sistema de Controle de Diaristas</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Bem-vindo!</CardTitle>
              <CardDescription>
                Gerencie suas diaristas, agendamentos e pagamentos de forma fácil e organizada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Faça login para acessar o sistema completo de controle de diaristas.
              </p>
              <Button 
                onClick={() => window.location.href = getLoginUrl()}
                className="w-full"
                style={{backgroundColor: '#471324'}}
                size="lg"
              >
                Fazer Login
              </Button>
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-1 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">📋 Gestão de Diaristas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Cadastre e gerencie suas diaristas com informações de contato e especialidades.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">📅 Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Agende serviços, controle datas e horários de forma simples.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">💰 Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Registre pagamentos e mantenha o controle financeiro atualizado.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">⭐ Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Avalie o trabalho das diaristas e mantenha histórico de qualidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-8 flex items-center gap-4">
          <img src="/logo-067vinhos.png" alt="067 Vinhos" className="h-16" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bem-vindo, {user?.name}!</h1>
            <p className="text-gray-600 mt-2">Sistema de Controle de Diaristas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {user?.role === 'admin' && (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/usuarios")}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">👥 Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" style={{color: '#471324'}}>Gerenciar</p>
                <p className="text-sm text-gray-600 mt-1">Permissões e roles</p>
              </CardContent>
            </Card>
          )}

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/dashboard")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">📊 Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold" style={{color: '#471324'}}>Monitorar</p>
              <p className="text-sm text-gray-600 mt-1">Visão geral do sistema</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/diaristas")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">👥 Diaristas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold" style={{color: '#471324'}}>Gerenciar</p>
              <p className="text-sm text-gray-600 mt-1">Cadastre e gerencie diaristas</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/agendamentos")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">📅 Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold" style={{color: '#471324'}}>Agendar</p>
              <p className="text-sm text-gray-600 mt-1">Crie novos agendamentos</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/pagamentos")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">💰 Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold" style={{color: '#471324'}}>Registrar</p>
              <p className="text-sm text-gray-600 mt-1">Registre pagamentos</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/relatorios")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">📊 Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold" style={{color: '#471324'}}>Visualizar</p>
              <p className="text-sm text-gray-600 mt-1">Veja relatórios e estatísticas</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/recibos")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">📋 Recibos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold" style={{color: '#471324'}}>Emitir</p>
              <p className="text-sm text-gray-600 mt-1">Gere recibos de pagamento</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setLocation("/diaristas?novo=true")}
              >
                ➕ Adicionar Nova Diarista
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setLocation("/agendamentos?novo=true")}
              >
                📅 Novo Agendamento
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setLocation("/pagamentos?novo=true")}
              >
                💳 Registrar Pagamento
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Usuário:</span>
                <span className="font-semibold">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo de Conta:</span>
                <span className="font-semibold capitalize">{user?.role}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc';

export function NotificationsWidget() {
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [aberto, setAberto] = useState(false);

  const { data: notificacoesData = [], refetch } = trpc.notificacao.list.useQuery(
    { limite: 10 }
  );

  const { data: naoLidasData = [] } = trpc.notificacao.naoLidas.useQuery();

  const marcarComoLidaMutation = trpc.notificacao.marcarComoLida.useMutation({
    onSuccess: () => refetch(),
  });

  const deletarMutation = trpc.notificacao.deletar.useMutation({
    onSuccess: () => refetch(),
  });

  useEffect(() => {
    if (notificacoesData) {
      setNotificacoes(notificacoesData);
    }
  }, [notificacoesData]);

  useEffect(() => {
    if (naoLidasData) {
      setNaoLidas(naoLidasData.length);
    }
  }, [naoLidasData]);

  const handleMarcarComoLida = (id: number) => {
    marcarComoLidaMutation.mutate({ notificacaoId: id });
  };

  const handleDeletar = (id: number) => {
    deletarMutation.mutate({ notificacaoId: id });
  };

  const getCor = (cor: string) => {
    const cores: Record<string, string> = {
      blue: 'bg-blue-50 border-blue-200',
      yellow: 'bg-yellow-50 border-yellow-200',
      green: 'bg-green-50 border-green-200',
      purple: 'bg-purple-50 border-purple-200',
      red: 'bg-red-50 border-red-200',
    };
    return cores[cor] || 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="relative">
      {/* BOTÃO DE NOTIFICAÇÕES */}
      <button
        onClick={() => setAberto(!aberto)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
        title="Notificações"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {naoLidas > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {naoLidas}
          </span>
        )}
      </button>

      {/* PAINEL DE NOTIFICAÇÕES */}
      {aberto && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 rounded-t-lg border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">🔔 Notificações</h3>
              <button
                onClick={() => setAberto(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-300 mt-1">
              {naoLidas} nova{naoLidas !== 1 ? 's' : ''}
            </p>
          </div>

          {/* LISTA DE NOTIFICAÇÕES */}
          <div className="max-h-96 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">Nenhuma notificação no momento</p>
              </div>
            ) : (
              notificacoes.map((notif) => (
                <div
                  key={notif.id}
                  className={`border-b border-gray-100 p-4 hover:bg-gray-50 transition ${getCor(
                    notif.cor
                  )} ${!notif.lido ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{notif.icone}</span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {notif.titulo}
                          </p>
                          {notif.descricao && (
                            <p className="text-sm text-gray-600 mt-1">
                              {notif.descricao}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notif.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-2">
                      {!notif.lido && (
                        <button
                          onClick={() => handleMarcarComoLida(notif.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          title="Marcar como lida"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletar(notif.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                        title="Deletar"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* FOOTER */}
          {notificacoes.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-b-lg border-t border-gray-200 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


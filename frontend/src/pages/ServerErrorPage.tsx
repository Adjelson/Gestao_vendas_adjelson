import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw, Home, ServerCrash } from 'lucide-react';

const ServerErrorPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="mb-6 flex justify-center">
                    <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
                        <ServerCrash size={48} />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Erro de Servidor</h1>
                <p className="text-gray-500 mb-8">
                    Pedimos desculpa, mas algo correu mal do nosso lado. A nossa equipa técnica já foi notificada.
                </p>

                <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-8 text-left">
                    <p className="text-xs text-orange-800 font-mono">
                        Error Code: 500 Internal Server Error
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <RefreshCcw size={20} />
                        Tentar Novamente
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                        <Home size={20} />
                        Ir para Início
                    </button>
                </div>
            </div>
            <div className="mt-8 text-center text-gray-400 text-sm">
                Se o problema persistir, contacte o suporte.
            </div>
        </div>
    );
};

export default ServerErrorPage;

import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-gray-100 animation-fadeIn">
                <div className="mb-6 flex justify-center">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                        <span className="text-5xl font-bold">404</span>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
                <p className="text-gray-500 mb-8">
                    Oops! A página que está à procura parece não existir ou foi movida.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                        Voltar
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
                &copy; {new Date().getFullYear()} Sistema de Gestão.
            </div>
        </div>
    );
};

export default NotFoundPage;

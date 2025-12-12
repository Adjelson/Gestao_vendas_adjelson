import React, { useState } from 'react';
import { Check, Building2, Package, ArrowRight, ArrowLeft } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../api/client';

// Schemas
const companySchema = Yup.object().shape({
    companyName: Yup.string().required('Nome da empresa é obrigatório'),
    nif: Yup.string().matches(/^[0-9]{9}$/, 'NIF deve ter 9 dígitos').required('NIF é obrigatório'),
    adminName: Yup.string().required('Nome do administrador é obrigatório'),
    email: Yup.string().email('Email inválido').required('Email é obrigatório'),
    password: Yup.string().min(6, 'Senha deve ter pelo menos 6 caracteres').required('Senha é obrigatória'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Senhas devem coincidir')
        .required('Confirmação de senha é obrigatória'),
});

const PACKAGES = [
    {
        id: 'starter',
        name: 'Starter',
        price: '0€',
        period: '/mês',
        features: ['1 Utilizador', 'Gestão de Vendas Básica', 'Relatórios Simples', 'Suporte por Email'],
        color: 'bg-blue-50 border-blue-200',
        btnColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
        id: 'pro',
        name: 'Profissional',
        price: '29€',
        period: '/mês',
        features: ['5 Utilizadores', 'Gestão de Stock', 'Relatórios Avançados', 'Faturação Certificada', 'Suporte Prioritário'],
        popular: true,
        color: 'bg-indigo-50 border-indigo-200',
        btnColor: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: '99€', // sob consulta usually, but giving a price for display
        period: '/mês',
        features: ['Utilizadores Ilimitados', 'API Dedicada', 'Multi-loja', 'Gestor de Conta Dedicado', 'SLA 99.9%'],
        color: 'bg-purple-50 border-purple-200',
        btnColor: 'bg-purple-600 hover:bg-purple-700'
    }
];

interface Props {
    onBack: () => void;
}

const CompanyRegistrationFlow: React.FC<Props> = ({ onBack }) => {
    const [step, setStep] = useState(1);
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const formik = useFormik({
        initialValues: {
            companyName: '',
            nif: '',
            adminName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema: companySchema,
        onSubmit: (values) => {
            // Move to package selection
            setStep(2);
        },
    });

    const handleFinalSubmit = async (packageId: string) => {
        setIsSubmitting(true);
        setError('');
        try {
            await api.post('/auth/register-company', {
                ...formik.values,
                packageId
            });
            // Show success or redirect
            alert('Registo efetuado com sucesso! Por favor faça login.');
            window.location.reload(); // Simple reload to go to login
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao registar empresa.');
            setIsSubmitting(false);
        }
    };

    if (step === 1) {
        return (
            <div className="animate-fade-in">
                <div className="mb-6">
                    <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-2">
                        <ArrowLeft size={16} /> Voltar ao Login
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">Registar Empresa</h2>
                    <p className="text-gray-500">Crie a sua conta e comece a gerir o seu negócio.</p>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                        <input
                            type="text"
                            {...formik.getFieldProps('companyName')}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${formik.touched.companyName && formik.errors.companyName ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="Minha Empresa Lda"
                        />
                        {formik.touched.companyName && formik.errors.companyName && (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.companyName}</div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NIF</label>
                        <input
                            type="text"
                            {...formik.getFieldProps('nif')}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${formik.touched.nif && formik.errors.nif ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="123456789"
                        />
                        {formik.touched.nif && formik.errors.nif && (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.nif}</div>
                        )}
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Dados do Administrador</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    {...formik.getFieldProps('adminName')}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${formik.touched.adminName && formik.errors.adminName ? 'border-red-300' : 'border-gray-300'}`}
                                    placeholder="João Silva"
                                />
                                {formik.touched.adminName && formik.errors.adminName && (
                                    <div className="text-red-500 text-xs mt-1">{formik.errors.adminName}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    {...formik.getFieldProps('email')}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${formik.touched.email && formik.errors.email ? 'border-red-300' : 'border-gray-300'}`}
                                    placeholder="joao@empresa.com"
                                />
                                {formik.touched.email && formik.errors.email && (
                                    <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                                    <input
                                        type="password"
                                        {...formik.getFieldProps('password')}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${formik.touched.password && formik.errors.password ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="******"
                                    />
                                    {formik.touched.password && formik.errors.password && (
                                        <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar</label>
                                    <input
                                        type="password"
                                        {...formik.getFieldProps('confirmPassword')}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="******"
                                    />
                                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                        <div className="text-red-500 text-xs mt-1">{formik.errors.confirmPassword}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            Próximo Passo <ArrowRight size={18} />
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // Step 2: Packages
    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-2">
                    <ArrowLeft size={16} /> Voltar aos dados
                </button>
                <h2 className="text-2xl font-bold text-gray-900">Escolha o seu Plano</h2>
                <p className="text-gray-500">Selecione o pacote que melhor se adapta ao seu negócio.</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100 flex items-center gap-2">
                    ⚠️ {error}
                </div>
            )}

            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                {PACKAGES.map((pkg) => (
                    <div
                        key={pkg.id}
                        className={`relative border rounded-xl p-5 transition-all cursor-pointer ${selectedPackage === pkg.id ? 'ring-2 ring-indigo-500 border-indigo-500 bg-white shadow-md' : 'border-gray-200 bg-white hover:border-indigo-300'}`}
                        onClick={() => setSelectedPackage(pkg.id)}
                    >
                        {pkg.popular && (
                            <span className="absolute -top-3 right-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-sm">
                                Mais Popular
                            </span>
                        )}
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{pkg.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-indigo-600">{pkg.price}</span>
                                    <span className="text-gray-500 text-sm">{pkg.period}</span>
                                </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPackage === pkg.id ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300'}`}>
                                {selectedPackage === pkg.id && <Check size={14} />}
                            </div>
                        </div>

                        <ul className="space-y-2 mb-4">
                            {pkg.features.map((feat, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                    <Check size={14} className="text-green-500 flex-shrink-0" />
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="pt-4 border-t mt-4">
                <button
                    onClick={() => selectedPackage && handleFinalSubmit(selectedPackage)}
                    disabled={!selectedPackage || isSubmitting}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all shadow-lg flex items-center justify-center gap-2 ${!selectedPackage || isSubmitting
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                        }`}
                >
                    {isSubmitting ? 'A criar conta...' : 'Finalizar Registo'}
                </button>
            </div>
        </div>
    );
};

export default CompanyRegistrationFlow;

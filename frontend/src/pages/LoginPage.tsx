import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../hooks/useAuth";
import api from "../api/client";
import CompanyRegistrationFlow from "../components/CompanyRegistrationFlow";
import "./LoginPage.css";

const loginSchema = Yup.object().shape({
    email: Yup.string().email("Email inválido").required("O email é obrigatório"),
    password: Yup.string()
        .min(6, "A senha deve ter pelo menos 6 caracteres")
        .required("A senha é obrigatória"),
});

const LoginPage = () => {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [loginError, setLoginError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: loginSchema,
        onSubmit: async (values, { setSubmitting }) => {
            setLoginError("");
            try {
                const { data } = await api.post("/auth/login", {
                    email: values.email,
                    password: values.password,
                });
                login(data.token, data.user);
                navigate("/");
            } catch (err: any) {
                setLoginError(
                    err.response?.data?.message ||
                    "Erro ao fazer login. Verifique suas credenciais."
                );
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="login-root">
            {/* Painel esquerdo: logo + introdução (oculto no mobile) */}
            <div className="login-hero">
                <div className="login-hero-inner">
                    <header className="login-hero-header">
                        <div className="login-logo-circle">SG</div>
                        <div>
                            <h1 className="login-system-name">SIGI – Sistema de Gestão Integrada</h1>
                            <p className="login-system-subtitle">
                                Centralize despesas, vendas e relatórios num só lugar.
                            </p>
                        </div>
                    </header>

                    <main className="login-hero-body">
                        <h2 className="login-hero-title">
                            Gestão profissional para o seu negócio.
                        </h2>
                        <p className="login-hero-text">
                            O SIGI ajuda a controlar receitas, despesas, fluxo de caixa e
                            relatórios em tempo real, com segurança e acesso multi-utilizador.
                        </p>

                        <ul className="login-hero-list">
                            <li>
                                <span className="login-hero-badge">✓</span>
                                Controle de caixa, vendas e despesas num único painel.
                            </li>
                            <li>
                                <span className="login-hero-badge">✓</span>
                                Relatórios e dashboards em tempo real.
                            </li>
                            <li>
                                <span className="login-hero-badge">✓</span>
                                Acesso seguro apenas para utilizadores autorizados.
                            </li>
                        </ul>
                    </main>

                    <footer className="login-hero-footer">
                        © {new Date().getFullYear()} SIGI. Todos os direitos reservados.
                    </footer>
                </div>
            </div>

            {/* Painel direito: card de login */}
            <div className="login-main">
                <div className="login-card">
                    {/* Cabeçalho para mobile / telas menores */}
                    <div className="login-mobile-header">
                        <div className="login-logo-circle login-logo-circle-sm">SG</div>
                        <div>
                            <h1 className="login-system-name-sm">
                                SIGI – Sistema de Gestão Integrada
                            </h1>
                            <p className="login-system-subtitle-sm">
                                Acesse o painel para gerir o seu negócio.
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 mb-8">
                        <button
                            className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'login' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('login')}
                        >
                            Entrar
                        </button>
                        <button
                            className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'register' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('register')}
                        >
                            Registar Empresa
                        </button>
                    </div>

                    {activeTab === 'login' ? (
                        <>
                            <h1 className="login-title">Entrar no sistema</h1>

                            {loginError && <div className="alert-error">{loginError}</div>}

                            <form onSubmit={formik.handleSubmit} className="login-form">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="email">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        className={`form-input ${formik.touched.email && formik.errors.email ? "error" : ""
                                            }`}
                                        placeholder="seu@email.com"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.email}
                                    />
                                    {formik.touched.email && formik.errors.email && (
                                        <div className="error-message">{formik.errors.email}</div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="password">
                                        Senha
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        className={`form-input ${formik.touched.password && formik.errors.password ? "error" : ""
                                            }`}
                                        placeholder="********"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.password}
                                    />
                                    {formik.touched.password && formik.errors.password && (
                                        <div className="error-message">{formik.errors.password}</div>
                                    )}
                                </div>

                                <div className="login-forgot-row">
                                    <button
                                        type="button"
                                        className="forgot-password-btn"
                                    // onClick={() => navigate("/esqueci-senha")} // se tiver rota
                                    >
                                        Esqueceu a senha?
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={formik.isSubmitting || !formik.isValid}
                                >
                                    {formik.isSubmitting ? "Entrando..." : "Entrar"}
                                </button>
                            </form>
                        </>
                    ) : (
                        <CompanyRegistrationFlow onBack={() => setActiveTab('login')} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

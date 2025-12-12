import { useDashboardSummary, useForecast, useSellerPerformance, useTopCustomers } from '../hooks/useDashboard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import './DashboardPage.css';

const DashboardPage = () => {
    const { data: summary, isLoading: isSummaryLoading } = useDashboardSummary();
    const { data: forecast, isLoading: isForecastLoading } = useForecast();
    const { data: sellers, isLoading: isSellersLoading } = useSellerPerformance();
    const { data: customers, isLoading: isCustomersLoading } = useTopCustomers();

    if (isSummaryLoading || isForecastLoading || isSellersLoading || isCustomersLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    const trendIcon = forecast?.trend === 'UP' ? <TrendingUp className="text-green-500" size={20} />
        : forecast?.trend === 'DOWN' ? <TrendingDown className="text-red-500" size={20} />
            : <Minus className="text-yellow-500" size={20} />;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: summary?.currency || 'EUR'
        }).format(value);
    };

    const growth = parseFloat(summary?.month?.growth || 0);
    const growthColor = growth >= 0 ? 'text-green-500' : 'text-red-500';
    const GrowthIcon = growth >= 0 ? ArrowUp : ArrowDown;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Dashboard</h1>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-title">Vendas Hoje</div>
                    <div className="kpi-value primary">{formatCurrency(summary?.today?.total || 0)}</div>
                    <div className="kpi-desc">{summary?.today?.count} vendas realizadas</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-title">Mês Atual</div>
                    <div className="kpi-value secondary">{formatCurrency(summary?.month?.total || 0)}</div>
                    <div className="flex items-center gap-1 mt-1 text-sm font-medium">
                        <span className={growthColor + " flex items-center"}>
                            <GrowthIcon size={14} /> {Math.abs(growth)}%
                        </span>
                        <span className="text-gray-400"> vs Mês Anterior</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-title">Ticket Médio</div>
                    <div className="kpi-value text-gray-700">{formatCurrency(summary?.ticketAvg || 0)}</div>
                    <div className="kpi-desc">Por venda realizada</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-title">Tendência</div>
                    <div className="kpi-value flex items-center gap-2">
                        {trendIcon}
                        <span className="text-lg">{forecast?.trend}</span>
                    </div>
                    <div className="kpi-desc">Próximos 7 dias</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                {/* Sales History & Forecast */}
                <div className="chart-card col-span-1 lg:col-span-2">
                    <h2 className="chart-title">Previsão e Histórico</h2>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[...(forecast?.history || []), ...(forecast?.forecast || [])]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString()} stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#718096" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `€${val}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" name="Vendas" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="chart-card">
                    <h2 className="chart-title">Top Produtos (Mês)</h2>
                    <div className="table-container">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>Qtd</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary?.topProducts?.map((p: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="font-medium text-sm">{p.name}</td>
                                        <td className="font-bold text-gray-600">{p.qty}</td>
                                    </tr>
                                ))}
                                {(!summary?.topProducts || summary.topProducts.length === 0) && (
                                    <tr><td colSpan={2} className="text-center py-4 text-gray-500">Sem dados disponíveis</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Seller Performance (RF05) */}
                <div className="chart-card">
                    <h2 className="chart-title">Performance Vendedores</h2>
                    <div className="table-container">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th className="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sellers?.map((s: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="font-medium text-sm">{s.name}</td>
                                        <td className="font-bold text-right text-green-600">{formatCurrency(s.total_sales)}</td>
                                    </tr>
                                ))}
                                {(!sellers || sellers.length === 0) && (
                                    <tr><td colSpan={2} className="text-center py-4 text-gray-500">Sem dados</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Customers (RF07) */}
                <div className="chart-card">
                    <h2 className="chart-title">Ranking Clientes</h2>
                    <div className="table-container">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th className="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers?.map((c: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="font-medium text-sm">{c.name}</td>
                                        <td className="font-bold text-right text-blue-600">{formatCurrency(c.total_spent)}</td>
                                    </tr>
                                ))}
                                {(!customers || customers.length === 0) && (
                                    <tr><td colSpan={2} className="text-center py-4 text-gray-500">Sem dados</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;

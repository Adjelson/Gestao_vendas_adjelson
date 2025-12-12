import React, { useState } from 'react';
import { useSales, useCreateSale } from '../hooks/useSales';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import { Trash, ShoppingCart, Plus, User, ChevronLeft, ChevronRight } from 'lucide-react';
import SalesFilters from '../components/SalesFilters';
import './SalesPage.css';
import api from '../api/client';

interface SaleItem {
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    total: number;
}

const SalesPage = () => {
    const [filters, setFilters] = useState({});

    // Reset pagination when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const { data: sales, isLoading: salesLoading } = useSales(filters); // hook accepts filters
    const { data: products } = useProducts();
    const { user } = useAuth();
    const createSaleMutation = useCreateSale();

    const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Pagination Logic
    const sortedSales = sales ? [...sales].sort((a: any, b: any) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime()) : [];
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSales = sortedSales.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = sales ? Math.ceil(sales.length / itemsPerPage) : 0;

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // New Sale Form State
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [customerId, setCustomerId] = useState<string>(''); // For now text input or simplified
    const [quantity, setQuantity] = useState<number>(1);

    // Customers State (Simple fetch for dropdown, or use hook if I created it)
    const [customers, setCustomers] = useState<any[]>([]);

    React.useEffect(() => {
        if (activeTab === 'new') {
            api.get('/customers').then(res => setCustomers(res.data)).catch(() => { });
        }
    }, [activeTab]);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || !products) return;

        const product = products.find((p: any) => p.id === parseInt(selectedProductId));
        if (!product) return;

        const newItem: SaleItem = {
            product_id: product.id,
            product_name: product.name,
            quantity: quantity,
            unit_price: product.price,
            total: quantity * product.price
        };

        setCart([...cart, newItem]);
        setSelectedProductId('');
        setQuantity(1);
    };

    const handleRemoveItem = (index: number) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    const calculateTotal = () => cart.reduce((acc, item) => acc + item.total, 0);

    const handleSubmitSale = async () => {
        if (cart.length === 0) return;
        try {
            await createSaleMutation.mutateAsync({
                user_id: user?.id,
                customer_id: customerId ? parseInt(customerId) : null,
                channel: 'STORE',
                items: cart.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price
                }))
            });
            setCart([]);
            setCustomerId('');
            setActiveTab('list');
            alert('Venda registada!');
        } catch (error) {
            alert('Erro ao registar venda.');
        }
    };

    const handleExport = () => {
        if (!sales) return;
        const headers = ["ID", "Data", "Operador", "Cliente", "Total", "Canal"];
        const rows = sales.map((s: any) => [
            s.id,
            new Date(s.sale_date).toLocaleString(),
            s.user_name || '-',
            s.customer_name || '-',
            s.total.toFixed(2),
            s.channel || 'STORE'
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map((e: any[]) => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "vendas_export.csv");
        document.body.appendChild(link);
        link.click();
    };

    if (salesLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    return (
        <div className="sales-container">
            <div className="sales-header">
                <h1 className="sales-title">Gerir Vendas</h1>
                <div className="tab-group">
                    <button
                        className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                        onClick={() => setActiveTab('list')}
                    >
                        Histórico
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
                        onClick={() => setActiveTab('new')}
                    >
                        Nova Venda
                    </button>
                </div>
            </div>

            {activeTab === 'list' && (
                <div className="space-y-4">
                    <SalesFilters onFilterChange={setFilters} onExport={handleExport} />

                    <div className="history-card">
                        <div className="overflow-x-auto">
                            <table className="sales-table w-full text-left text-sm text-gray-700">
                                <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4 rounded-tl-lg">Nº</th>
                                        <th className="px-6 py-4">Data</th>
                                        <th className="px-6 py-4">Operador</th>
                                        <th className="px-6 py-4">Cliente</th>
                                        <th className="px-6 py-4">Canal</th>
                                        <th className="px-6 py-4 text-right rounded-tr-lg">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 border-t border-gray-100">
                                    {currentSales?.map((sale: any, index: number) => (
                                        <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-gray-500">#{indexOfFirstItem + index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">
                                                        {new Date(sale.sale_date).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(sale.sale_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                                                        {sale.user_name?.[0] || 'U'}
                                                    </div>
                                                    {sale.user_name || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{sale.customer_name || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sale.channel === 'ONLINE' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {sale.channel || 'STORE'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-medium text-gray-900">
                                                {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(sale.total)}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!currentSales || currentSales.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                        <ShoppingCart size={24} />
                                                    </div>
                                                    <p>Sem vendas registadas com estes filtros.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {sales && sales.length > 0 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-lg">
                                <span className="text-sm text-gray-500">
                                    A mostrar <span className="font-medium text-gray-900">{indexOfFirstItem + 1}</span> a <span className="font-medium text-gray-900">{Math.min(indexOfLastItem, sales.length)}</span> de <span className="font-medium text-gray-900">{sales.length}</span> resultados
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-600"
                                        title="Página anterior"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {/*Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            // Logic to show pages around current page could be complex, keeping it simple for now or just standard numbers
                                            // Let's do a simple sliding window or just 1..N if small, or current if large.
                                            // For simplicity in this step, let's just render current page indicator to avoid complex logic in JSX directly without a helper.
                                            // Actually, let's just do a simple "Page X of Y" or a few numbers.
                                            let p = i + 1;
                                            if (totalPages > 5) {
                                                // Simple logic: if current > 3, shift.
                                                if (currentPage > 3) p = currentPage - 2 + i;
                                                // Clamp
                                                if (p > totalPages) p = p - (p - totalPages); // this logic is flawed for simple map.
                                            }
                                            return p;
                                        })
                                            // Let's stick to simple Prev/Next and "Page X of Y" for robustness if I don't want to add complex rendering logic
                                       */ }
                                        <span className="text-sm font-medium text-gray-700">
                                            Página {currentPage} de {totalPages}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-600"
                                        title="Próxima página"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'new' && (
                <div className="pos-grid">
                    {/* INPUT FORM */}
                    <div className="pos-card">
                        <h2 className="pos-title">Adicionar Item</h2>

                        {/* Customer Selection */}
                        <div className="highlight-box">
                            <label className="pos-label flex items-center gap-2">
                                <User size={16} className="text-indigo-600" /> Cliente (Opcional)
                            </label>
                            <select
                                className="pos-select mt-1"
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                            >
                                <option value="">Cliente Final (Anónimo)</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.nif || 'N/A'})</option>
                                ))}
                            </select>
                        </div>

                        <form onSubmit={handleAddItem} className="pos-form">
                            <div>
                                <label className="pos-label">Produto</label>
                                <select
                                    className="pos-select"
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                    required
                                >
                                    <option value="">Selecione um produto...</option>
                                    {products?.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.name} - €{p.price}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="pos-label">Quantidade</label>
                                <input
                                    type="number"
                                    className="pos-input"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-pos-add">
                                <span className="flex items-center justify-center gap-2">
                                    <Plus size={20} /> Adicionar ao Carrinho
                                </span>
                            </button>
                        </form>
                    </div>

                    {/* CART REVIEW */}
                    <div className="pos-card">
                        <h2 className="pos-title">
                            Carrinho
                            <ShoppingCart size={24} className="text-blue-500" />
                        </h2>

                        <div className="overflow-y-auto max-h-80">
                            <table className="cart-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th className="text-center">Qtd</th>
                                        <th className="text-right">Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="font-medium">{item.product_name}</td>
                                            <td className="text-center">{item.quantity}</td>
                                            <td className="text-right font-mono">€{item.total.toFixed(2)}</td>
                                            <td>
                                                <button className="btn-remove" onClick={() => handleRemoveItem(idx)}>
                                                    <Trash size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {cart.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-8 text-gray-400 italic">
                                                Carrinho vazio
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="cart-summary">
                            <div className="total-row">
                                <span>Total:</span>
                                <span>{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(calculateTotal())}</span>
                            </div>

                            <button
                                className="btn-checkout"
                                disabled={cart.length === 0 || createSaleMutation.isPending}
                                onClick={handleSubmitSale}
                            >
                                {createSaleMutation.isPending ? 'A processar...' : 'Finalizar Venda'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesPage;

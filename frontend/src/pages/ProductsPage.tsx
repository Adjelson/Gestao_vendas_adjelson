import React, { useState } from 'react';
import { useProducts, useCreateProduct } from '../hooks/useProducts';
import { Plus } from 'lucide-react';
import './ProductsPage.css';

const ProductsPage = () => {
    const { data: products, isLoading } = useProducts();
    const createProductMutation = useCreateProduct();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', price: '', category: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createProductMutation.mutateAsync({
                name: formData.name,
                price: parseFloat(formData.price),
                category: formData.category
            });
            setIsModalOpen(false);
            setFormData({ name: '', price: '', category: '' });
        } catch (error) {
            alert('Erro ao criar produto');
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    return (
        <div className="products-container">
            <div className="products-header">
                <h1 className="products-title">Produtos</h1>
                <button className="btn-add" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> Novo Produto
                </button>
            </div>

            <div className="table-card">
                <div className="overflow-x-auto">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Categoria</th>
                                <th>Preço</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products?.map((product: any) => (
                                <tr key={product.id}>
                                    <td className="text-gray-500">#{product.id}</td>
                                    <td className="product-name">{product.name}</td>
                                    <td>
                                        <span className="badge badge-neutral">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="font-mono">
                                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(product.price)}
                                    </td>
                                    <td>
                                        <div className={`status-badge ${product.is_active ? 'status-active' : 'status-inactive'}`}>
                                            {product.is_active ? 'Ativo' : 'Inativo'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">No products found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Novo Produto</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label className="form-label">Nome</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Nome do produto"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Categoria</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="Categoria"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Preço</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn-save">Salvar Produto</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;

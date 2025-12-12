import React, { useEffect, useState } from 'react';
import api from '../api/client';
import './CompanySettingsPage.css';

const CompanySettingsPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        nif: '',
        address: '',
        currency: 'EUR'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/company/settings');
            setFormData({
                name: data.name || '',
                nif: data.nif || '',
                address: data.address || '',
                currency: data.currency || 'EUR'
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching settings');
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/company/settings', formData);
            alert('Configurações atualizadas!');
        } catch (error) {
            alert('Erro ao atualizar configurações.');
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    return (
        <div className="settings-container">
            <div className="settings-card">
                <div className="settings-header">
                    <h1 className="settings-title">Configurações da Empresa</h1>
                    <p className="settings-subtitle">Gerencie as informações principais do seu negócio</p>
                </div>

                <form onSubmit={handleSubmit} className="settings-form">
                    <div className="form-group">
                        <label className="form-label">Nome da Empresa</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="Ex: Minha Loja Lda"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">NIF (Número de Identificação Fiscal)</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.nif}
                            onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                            placeholder="Ex: 123456789"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Morada / Endereço</label>
                        <textarea
                            className="form-textarea"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Rua Exemplo, 123, Cidade, País"
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Moeda Base</label>
                        <select
                            className="form-select"
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        >
                            <option value="EUR">Euro (€)</option>
                            <option value="USD">Dólar ($)</option>
                            <option value="BRL">Real (R$)</option>
                            <option value="AOA">Kwanza (Kz)</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary">Salvar Alterações</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanySettingsPage;

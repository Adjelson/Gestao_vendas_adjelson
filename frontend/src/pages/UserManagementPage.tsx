import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Plus } from 'lucide-react';
import './UserManagementPage.css';

const UserManagementPage = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '', email: '', password: '', role: 'EMPLOYEE',
        permissions: { can_view_dashboard: true, can_create_sales: true }
    });

    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await api.get('/users');
            return data;
        }
    });

    const createUserMutation = useMutation({
        mutationFn: async (userData: any) => {
            const { data } = await api.post('/users', userData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsModalOpen(false);
            setNewUser({ name: '', email: '', password: '', role: 'EMPLOYEE', permissions: { can_view_dashboard: true, can_create_sales: true } });
        }
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.patch(`/users/${id}/toggle-status`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createUserMutation.mutate(newUser);
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    return (
        <div className="users-container">
            <div className="users-header">
                <h1 className="users-title">Gerir Utilizadores</h1>
                <button className="btn-add-user" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> Novo Utilizador
                </button>
            </div>

            <div className="users-card">
                <div className="overflow-x-auto">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Função</th>
                                <th>Estado</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.map((u: any) => (
                                <tr key={u.id}>
                                    <td className="font-medium text-gray-900">{u.name}</td>
                                    <td className="text-gray-600">{u.email}</td>
                                    <td>
                                        <span className={`user-role-badge ${u.role === 'COMPANY_ADMIN' ? 'role-admin' : 'role-employee'}`}>
                                            {u.role === 'COMPANY_ADMIN' ? 'Admin' : 'Funcionário'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={`user-status-badge ${u.is_active ? 'status-active' : 'status-inactive'}`}>
                                            <span className={`status-dot ${u.is_active ? 'dot-active' : 'dot-inactive'}`}></span>
                                            {u.is_active ? 'Ativo' : 'Inativo'}
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-toggle-status"
                                            onClick={() => toggleStatusMutation.mutate(u.id)}
                                        >
                                            {u.is_active ? 'Inativar' : 'Ativar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="user-modal-overlay">
                    <div className="user-modal-content">
                        <h3 className="user-modal-title">Adicionar Utilizador</h3>
                        <form onSubmit={handleSubmit} className="user-form">
                            <input
                                type="text"
                                placeholder="Nome Completo"
                                className="form-input"
                                value={newUser.name}
                                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                className="form-input"
                                value={newUser.email}
                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Senha Temporária"
                                className="form-input"
                                value={newUser.password}
                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                required
                            />

                            <select
                                className="form-select"
                                value={newUser.role}
                                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                            >
                                <option value="EMPLOYEE">Funcionário</option>
                                <option value="COMPANY_ADMIN">Administrador</option>
                            </select>

                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        className="checkbox-input"
                                        checked={newUser.permissions.can_view_dashboard}
                                        onChange={e => setNewUser({ ...newUser, permissions: { ...newUser.permissions, can_view_dashboard: e.target.checked } })}
                                    />
                                    <span>Ver Dashboard</span>
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        className="checkbox-input"
                                        checked={newUser.permissions.can_create_sales}
                                        onChange={e => setNewUser({ ...newUser, permissions: { ...newUser.permissions, can_create_sales: e.target.checked } })}
                                    />
                                    <span>Registar Vendas</span>
                                </label>
                            </div>

                            <div className="modal-footer">
                                <button type="submit" className="btn-create">Criar Utilizador</button>
                                <button type="button" className="btn-cancel-modal" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementPage;

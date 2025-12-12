import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, ShoppingCart, Package, Settings, LogOut, Users, Menu, X, Store } from 'lucide-react';
import './MainLayout.css';

const MainLayout = () => {
    const { user, logout, hasPermission } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, visible: hasPermission('DASHBOARD_VIEW') || hasPermission('SALES_VIEW_OWN') },
        { path: '/sales', label: 'Vendas', icon: <ShoppingCart size={20} />, visible: hasPermission('SALES_CREATE') || hasPermission('SALES_VIEW_OWN') },
        { path: '/products', label: 'Produtos', icon: <Package size={20} />, visible: hasPermission('PRODUCTS_MANAGE') || hasPermission('SALES_CREATE') }, // Sellers need products to sell
        { path: '/users', label: 'Utilizadores', icon: <Users size={20} />, visible: hasPermission('USERS_MANAGE') },
        { path: '/settings', label: 'Empresa', icon: <Settings size={20} />, visible: hasPermission('COMPANY_SETTINGS') },
    ];

    return (
        <div className="layout-container">
            {/* Mobile Toggle */}
            <button className="mobile-toggle" onClick={toggleMobileMenu}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            <div
                className={`overlay ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <Store size={28} className="text-blue-400" />
                    <span>Gestão Vendas</span>
                </div>

                <nav className="flex-1">
                    <ul className="sidebar-menu">
                        {menuItems.filter(i => i.visible).map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-name">{user?.name}</div>
                        <div className="user-email">{user?.email}</div>
                    </div>
                    <button onClick={handleLogout} className="btn-logout">
                        <LogOut size={18} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;

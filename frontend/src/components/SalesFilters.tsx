import React, { useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';

interface SalesFiltersProps {
    onFilterChange: (filters: any) => void;
    onExport: () => void;
}

const SalesFilters = ({ onFilterChange, onExport }: SalesFiltersProps) => {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        seller_id: '',
        channel: '',
        min_total: '',
        max_total: ''
    });

    const [isExpanded, setIsExpanded] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
    };

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();
        onFilterChange(filters);
    };

    return (
        <div className="card-panel mb-6">
            <div className="flex justify-between items-center mb-4">
                <button
                    className="flex items-center gap-2 text-gray-700 font-semibold hover:text-blue-600 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <Filter size={20} />
                    Filtros Avançados
                </button>
                <button
                    className="btn btn-secondary text-sm gap-2"
                    type="button"
                    onClick={onExport}
                >
                    <Download size={16} /> Excel/CSV
                </button>
            </div>

            {isExpanded && (
                <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="form-control">
                        <label className="label-text">Data Início</label>
                        <input
                            type="date"
                            name="startDate"
                            className="input-field"
                            value={filters.startDate}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label-text">Data Fim</label>
                        <input
                            type="date"
                            name="endDate"
                            className="input-field"
                            value={filters.endDate}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label-text">Canal</label>
                        <select
                            name="channel"
                            className="select-field"
                            value={filters.channel}
                            onChange={handleChange}
                        >
                            <option value="">Todos</option>
                            <option value="STORE">Loja Física</option>
                            <option value="ONLINE">Online</option>
                            <option value="MOBILE">Mobile</option>
                        </select>
                    </div>
                    <div className="form-control">
                        <label className="label-text">Valor Mínimo</label>
                        <input
                            type="number"
                            name="min_total"
                            placeholder="€ 0.00"
                            className="input-field"
                            value={filters.min_total}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-span-1 md:col-span-3 lg:col-span-4 flex justify-end gap-2 mt-2">
                        <button type="submit" className="btn btn-primary">
                            <Search size={16} /> Pesquisar
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default SalesFilters;

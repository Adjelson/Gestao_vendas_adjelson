const db = require('../config/db');

const getSettings = async (req, res) => {
    try {
        const { company_id } = req.user;
        const [companies] = await db.query('SELECT name, nif, address, currency FROM companies WHERE id = ?', [company_id]);
        
        if (companies.length === 0) return res.status(404).json({ message: 'Empresa não encontrada' });
        
        res.json(companies[0]);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter configurações.' });
    }
};

const updateSettings = async (req, res) => {
    try {
        const { company_id } = req.user;
        const { name, nif, address, currency } = req.body;
        
        await db.query(
            'UPDATE companies SET name = ?, nif = ?, address = ?, currency = ? WHERE id = ?',
            [name, nif, address, currency, company_id]
        );
        
        res.json({ message: 'Configurações atualizadas com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar configurações.' });
    }
};

module.exports = { getSettings, updateSettings };

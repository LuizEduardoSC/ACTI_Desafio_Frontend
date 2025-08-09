import axios from 'axios';

export const getCNPJData = async (cnpj) => {
    try {
        const res = await axios.get(`http://localhost:8080/api/cnpj/${cnpj}`);
        const data = res.data;
        // Se o backend retornou string JSON, converte
        if (typeof data === 'string') {
            return JSON.parse(data);
        }
        return data;
    } catch (error) {
        console.error("Erro ao buscar CNPJ:", error.response?.data || error.message);
        return null;
    }
};

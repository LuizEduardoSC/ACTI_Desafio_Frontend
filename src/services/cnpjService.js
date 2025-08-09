import axios from 'axios';

export const getCNPJData = async (cnpj) => {
    try {
        const res = await axios.get(`https://receitaws.com.br/v1/cnpj/${cnpj}`);
        return res.data;
    } catch {
        return null;
    }
};
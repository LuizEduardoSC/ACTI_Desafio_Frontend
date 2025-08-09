import axios from 'axios';

export const getCEPData = async (cep) => {
    try {
        const res = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        return res.data;
    } catch {
        return null;
    }
};
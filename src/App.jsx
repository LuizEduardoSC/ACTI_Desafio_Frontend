import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import FormInput from './components/FormInput';
import { getCEPData } from './services/cepService';
import { getCNPJData } from './services/cnpjService';

const schema = yup.object().shape({
  tipoParceiro: yup.string().required('Tipo obrigatório'),
  personalidade: yup.string().required('Personalidade obrigatória'),
  razaoSocial: yup.string().required('Razão Social obrigatória'),
  nomeFantasia: yup.string().required('Nome Fantasia obrigatório'),
  cpfCnpj: yup.string().required('CPF/CNPJ obrigatório'),
  segmento: yup.string().required('Segmento obrigatório'),
  categoria: yup.string().required('Categoria obrigatória'),
  cep: yup.string().required('CEP obrigatório'),
  pais: yup.string().required(),
  uf: yup.string().required('UF obrigatória'),
  municipio: yup.string().required('Município obrigatório'),
  logradouro: yup.string().required('Logradouro obrigatório'),
  numero: yup.string().required('Número obrigatório'),
  bairro: yup.string().required('Bairro obrigatório'),
  email: yup.string().email('Email inválido').required('Email obrigatório'),
  telefone: yup.string().required('Telefone obrigatório'),
  celular: yup.string().required('Celular obrigatório'),
});

function App() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const [status, setStatus] = useState(null);

  const onSubmit = async (data) => {
    try {
      await axios.post('http://localhost:8080/api/parceiros', data);
      setStatus({ success: true, message: 'Parceiro cadastrado com sucesso!' });
    } catch (err) {
      setStatus({ success: false, message: 'Erro ao cadastrar parceiro.' });
    }
  };

  const handleCNPJBlur = async (e) => {
    const cnpj = e.target.value.replace(/\D/g, '');
    const result = await getCNPJData(cnpj);
    if (result) {
      setValue('razaoSocial', result.nome);
      setValue('nomeFantasia', result.fantasia);
    }
  };

  const handleCEPBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    const result = await getCEPData(cep);
    if (result) {
      setValue('logradouro', result.logradouro);
      setValue('bairro', result.bairro);
      setValue('municipio', result.localidade);
      setValue('uf', result.uf);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Cadastro de Parceiro</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInput label="Tipo de Parceiro" {...register('tipoParceiro')} error={errors.tipoParceiro} />
        <FormInput label="Personalidade" {...register('personalidade')} error={errors.personalidade} />
        <FormInput label="Razão Social" {...register('razaoSocial')} error={errors.razaoSocial} />
        <FormInput label="Nome Fantasia" {...register('nomeFantasia')} error={errors.nomeFantasia} />
        <FormInput label="CPF/CNPJ" name="cpfCnpj" {...register('cpfCnpj')} error={errors.cpfCnpj} dynamicMask onBlur={handleCNPJBlur}
/>

        <FormInput label="Segmento" {...register('segmento')} error={errors.segmento} />
        <FormInput label="Categoria" {...register('categoria')} error={errors.categoria} />
        <FormInput label="CEP" {...register('cep')} error={errors.cep} mask="00000-000" onBlur={handleCEPBlur} />
        <FormInput label="País" {...register('pais')} defaultValue="Brasil" />
        <FormInput label="UF" {...register('uf')} error={errors.uf} />
        <FormInput label="Município" {...register('municipio')} error={errors.municipio} />
        <FormInput label="Logradouro" {...register('logradouro')} error={errors.logradouro} />
        <FormInput label="Número" {...register('numero')} error={errors.numero} />
        <FormInput label="Bairro" {...register('bairro')} error={errors.bairro} />
        <FormInput label="Email" {...register('email')} error={errors.email} />
        <FormInput label="Telefone" {...register('telefone')} error={errors.telefone} mask="(00) 0000-0000" />
        <FormInput label="Celular" {...register('celular')} error={errors.celular} mask="(00) 00000-0000" />
        <FormInput label="Complemento" {...register('complemento')} />
        <FormInput label="Observação" {...register('observacao')} />

        <button type="submit" className="btn btn-primary">Cadastrar</button>
      </form>

      {status && (
        <div className={`mt-3 alert ${status.success ? 'alert-success' : 'alert-danger'}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}

export default App;
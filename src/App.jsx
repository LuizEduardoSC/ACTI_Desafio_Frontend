import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import FormInput from './components/FormInput';
import { getCEPData } from './services/cepService';

const schema = yup.object().shape({
  tipoParceiro: yup.string().required('Tipo obrigatório'),
  personalidade: yup
    .string()
    .required('Personalidade obrigatória')
    .matches(/^(Física|Jurídica)$/, "Deve ser 'Física' ou 'Jurídica'"),
  razaoSocial: yup.string().required('Razão Social obrigatória').max(255),
  nomeFantasia: yup.string().max(255),
  cpfCnpj: yup
    .string()
    .required('CPF/CNPJ obrigatório')
    .matches(
      /^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})|(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})$/,
      'CPF ou CNPJ inválido'
    ),
  segmento: yup.string().required('Segmento obrigatório').max(100),
  categoria: yup.string().required('Categoria obrigatória').max(100),
  cep: yup
    .string()
    .required('CEP obrigatório')
    .matches(/^\d{5}-\d{3}$/, 'Formato do CEP deve ser XXXXX-XXX'),
  pais: yup.string().required(),
  uf: yup.string().required('UF obrigatória').length(2),
  municipio: yup.string().required('Município obrigatório').max(100),
  logradouro: yup.string().required('Logradouro obrigatório').max(255),
  numero: yup.string().required('Número obrigatório').max(10),
  bairro: yup.string().required('Bairro obrigatório').max(100),
  complemento: yup.string().max(255),
  observacao: yup.string().max(500),
  email: yup
    .string()
    .required('Email obrigatório')
    .email('Email inválido')
    .max(100),
  telefone: yup
    .string()
    .required('Telefone obrigatório')
    .matches(
      /^\(\d{2}\) \d{4,5}-\d{4}$/,
      'Formato: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX'
    ),
  celular: yup
    .string()
    .required('Celular obrigatório')
    .matches(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato: (XX) XXXXX-XXXX'),
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
    console.log('Dados enviados:', data);

    const cleanData = {
      ...data,
      cpfCnpj: data.cpfCnpj?.replace(/\D/g, ''), // limpa CPF/CNPJ
      // telefone, celular e cep mantêm a máscara
    };

    try {
      await axios.post('http://localhost:8080/api/parceiros', cleanData);
      setStatus({ success: true, message: 'Parceiro cadastrado com sucesso!' });
    } catch (err) {
      console.error('Erro ao cadastrar parceiro:', err.response?.data || err.message);
      console.log('Detalhes do erro:', err.response?.data?.errors);
      setStatus({ success: false, message: 'Erro ao cadastrar parceiro.' });
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

        <FormInput
          label="CPF/CNPJ"
          name="cpfCnpj"
          {...register('cpfCnpj')}
          error={errors.cpfCnpj}
          dynamicMask
          onAutoFill={(auto) => {
            if (auto.razaoSocial) setValue('razaoSocial', auto.razaoSocial);

            // Se não tiver nome fantasia, usa a razão social como fallback
            const fantasiaFinal =
              auto.nomeFantasia && auto.nomeFantasia.trim() !== ''
                ? auto.nomeFantasia
                : auto.razaoSocial || 'Sem nome fantasia';

            setValue('nomeFantasia', fantasiaFinal);
          }}
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
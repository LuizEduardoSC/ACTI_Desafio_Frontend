import { forwardRef, useRef } from 'react';
import { useIMask } from 'react-imask';
import { getCNPJData } from '../services/cnpjService'; // ajuste caminho se necessário

const FormInput = forwardRef(
    ({ label, name, error, dynamicMask, required, onAutoFill, ...props }, ref) => {
        const inputEl = useRef(null);
        const lastFetched = useRef(null); // evita chamadas duplicadas

        const maskOptions = dynamicMask
            ? {
                mask: [
                    { mask: '000.000.000-00' },      // CPF
                    { mask: '00.000.000/0000-00' }   // CNPJ
                ],
                dispatch: function (appended, dynamicMasked) {
                    const number = (dynamicMasked.value + appended).replace(/\D/g, '');
                    return number.length > 11
                        ? dynamicMasked.compiledMasks[1] // CNPJ
                        : dynamicMasked.compiledMasks[0]; // CPF
                }
            }
            : undefined;

        const { ref: maskRef } = useIMask(maskOptions, {
            onAccept: async (value) => {
                // garante integração com onChange do parent
                props.onChange?.({ target: { name, value } });

                // auto-fill apenas para o campo cpfCnpj (ou ajuste o name)
                if (name === 'cpfCnpj') {
                    const onlyNumbers = value.replace(/\D/g, '');
                    if (onlyNumbers.length === 14) {
                        // evita refazer a mesma consulta repetidamente
                        if (lastFetched.current === onlyNumbers) return;
                        lastFetched.current = onlyNumbers;

                        try {
                            const data = await getCNPJData(onlyNumbers);
                            if (!data) return;

                            // normaliza caso backend envie string
                            const obj = typeof data === 'string' ? JSON.parse(data) : data;

                            // monta objeto de autofill com os campos que você quer popular
                            const auto = {};
                            if (obj.nome) auto.razaoSocial = obj.nome;
                            auto.razaoSocial = obj.nome || ''; // sempre preenche

                            // se não tiver nome fantasia, usa a razão social como fallback
                            auto.nomeFantasia = obj.fantasia && obj.fantasia.trim() !== ''
                                ? obj.fantasia
                                : obj.nome || 'Sem nome fantasia';

                            /* if (obj.cep) auto.cep = obj.cep;
                            if (obj.logradouro) auto.logradouro = obj.logradouro;
                            if (obj.bairro) auto.bairro = obj.bairro;
                            if (obj.municipio) auto.municipio = obj.municipio;
                            if (obj.uf) auto.uf = obj.uf; */

                            // chama callback no parent para popular os campos (se foi passado)
                            if (Object.keys(auto).length > 0 && typeof onAutoFill === 'function') {
                                onAutoFill(auto);
                            }
                        } catch (err) {
                            console.error('Erro ao obter dados do CNPJ', err);
                        }
                    }
                }
            }
        });

        const inputRef = (node) => {
            inputEl.current = node;
            if (maskRef) maskRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
        };

        return (
            <div className="mb-3">
                {label && (
                    <label htmlFor={name} className="form-label">
                        {label} {required && <span className="text-danger">*</span>}
                    </label>
                )}
                <input
                    id={name}
                    name={name}
                    ref={inputRef}
                    className={`form-control ${error ? 'is-invalid' : ''}`}
                    {...props}
                />
                {error && <div className="invalid-feedback">{error.message}</div>}
            </div>
        );
    }
);

export default FormInput;
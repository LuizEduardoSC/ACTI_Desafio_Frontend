import { useIMask } from 'react-imask';
import { forwardRef, useRef } from 'react';

const FormInput = forwardRef(({ label, name, error, mask, dynamicMask, required, ...props }, ref) => {
    const inputEl = useRef(null);

    const defaultMask = dynamicMask ? '000.000.000-00' : mask;

    const { ref: maskRef, setMask } = useIMask(
        defaultMask ? { mask: defaultMask } : null,
        {
            onAccept: (value) => props.onChange?.({ target: { value } }),
        }
    );

    const handleInput = (e) => {
        if (dynamicMask && setMask) {
            const raw = e.target.value.replace(/\D/g, '');
            if (raw.length > 11) {
                setMask('00.000.000/0000-00'); // CNPJ
            } else {
                setMask('000.000.000-00'); // CPF
            }
        }

        props.onChange?.(e); // garante que o React Hook Form receba o valor
    };

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
                onInput={handleInput}
                className={`form-control ${error ? 'is-invalid' : ''}`}
                {...props}
            />
            {error && <div className="invalid-feedback">{error.message}</div>}
        </div>
    );
});

export default FormInput;

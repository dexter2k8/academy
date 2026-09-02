import { useState, useRef } from "react";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
  className,
}: NumberInputProps) {
  const lastCommittedRef = useRef(value);
  const [text, setText] = useState(String(value));

  if (value !== lastCommittedRef.current) {
    lastCommittedRef.current = value;
    setText(String(value));
  }

  const commit = () => {
    let parsed = parseFloat(text);
    if (isNaN(parsed)) parsed = min ?? 0;
    if (min !== undefined && parsed < min) parsed = min;
    if (max !== undefined && parsed > max) parsed = max;
    lastCommittedRef.current = parsed;
    setText(String(parsed));
    if (parsed !== value) onChange(parsed);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "" || raw === "-" || /^-?\d*\.?\d*$/.test(raw)) {
      setText(raw);
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      onChange={handleChange}
      onBlur={commit}
      step={step}
      className={className}
    />
  );
}

import { useId, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input(props: InputProps) {
  const { label, ...rest } = props;
  const id = useId();
  return (
    <div className="my-2">
      {label && (
        <label htmlFor={id} className="text-center w-full block">
          {label}
        </label>
      )}
      <input
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={`Enter ${label || "input"}`}
        {...rest}
        id={id}
        name={label}
      />
    </div>
  );
}

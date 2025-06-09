import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button(props: ButtonProps) {
  const { children, ...rest } = props;
  return <button {...rest}>{children}</button>;
}

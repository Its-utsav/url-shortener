type ContainerProps = { children: React.ReactNode };
export default function Container({ children }: ContainerProps) {
  return <div className="max-auto w-full p-2">{children}</div>;
}

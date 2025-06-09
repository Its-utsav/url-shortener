import { Logo, Container } from "./index";

export default function Header() {
  return (
    <header className="flex items-center justify-between w-full">
      <Container>
        <nav className="w-24 h-24 ">
          <Logo />
        </nav>
      </Container>
    </header>
  );
}

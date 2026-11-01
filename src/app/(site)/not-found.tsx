import Link from "next/link";
import { Container } from "@/components/site/ui";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="eyebrow">Erro 404</p>
      <h1 className="text-4xl font-semibold text-brown-dark">Página não encontrada</h1>
      <p className="mt-3 text-muted">O endereço pode ter mudado ou não existe.</p>
      <Link href="/" className="btn-primary mt-8">Voltar ao início</Link>
    </Container>
  );
}

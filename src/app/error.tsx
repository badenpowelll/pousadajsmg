"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold text-brown-dark">Algo deu errado</h1>
      <p className="mt-3 text-muted">Tente novamente em instantes. Se o problema persistir, fale com a pousada pelo WhatsApp.</p>
      <button onClick={reset} className="btn-primary mt-8">Tentar de novo</button>
    </main>
  );
}

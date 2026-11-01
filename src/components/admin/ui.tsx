import type { ReservationStatus } from "@/db/schema";

export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold text-brown-dark">{title}</h1>
      {children}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`card p-5 ${className}`}>{children}</div>;
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-brown-dark">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export const STATUS_LABEL: Record<ReservationStatus, string> = {
  REQUESTED: "Solicitada",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Concluída",
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const cls = {
    REQUESTED: "bg-warning/15 text-warning",
    CONFIRMED: "bg-success/15 text-success",
    CANCELLED: "bg-danger/15 text-danger",
    COMPLETED: "bg-sand text-muted",
  }[status];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{STATUS_LABEL[status]}</span>;
}

export function Flash({ ok, erro }: { ok?: string; erro?: string }) {
  if (ok) return <div role="status" className="mb-4 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">{ok}</div>;
  if (erro) return <div role="alert" className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</div>;
  return null;
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-sand/60 text-left text-xs tracking-wide text-muted uppercase">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-sand-dark/60">{children}</tbody>
      </table>
    </div>
  );
}

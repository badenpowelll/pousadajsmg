import { desc } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { Flash, PageTitle } from "@/components/admin/ui";
import { markRead } from "./actions";

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const sp = await searchParams;
  const rows = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200);
  return (
    <>
      <PageTitle title="Mensagens de contato" />
      <Flash ok={sp.ok} />
      <ul className="space-y-3">
        {rows.map((m) => (
          <li key={m.id} className={`card p-4 ${m.read ? "opacity-70" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-brown-dark">{m.name} <span className="font-normal text-muted">· <a className="text-brand" href={`mailto:${m.email}`}>{m.email}</a>{m.phone ? ` · ${m.phone}` : ""}</span></p>
                <p className="text-xs text-muted">{m.createdAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</p>
              </div>
              {!m.read ? <form action={markRead}><input type="hidden" name="id" value={m.id} /><button className="btn-ghost btn-sm">Marcar como lida</button></form> : null}
            </div>
            <p className="mt-3 text-sm whitespace-pre-line">{m.message}</p>
          </li>
        ))}
        {!rows.length ? <li className="text-muted">Nenhuma mensagem.</li> : null}
      </ul>
    </>
  );
}

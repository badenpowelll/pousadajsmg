import Image from "next/image";
import Script from "next/script";
import { Play } from "lucide-react";
import { InstagramIcon } from "./social-icons";
import { Container, SectionHeading } from "./ui";
import { fetchInstagramFeed, listInstagramEmbeds } from "@/services/instagram";

export async function InstagramSection({ profileUrl }: { profileUrl: string | null }) {
  const [feed, embeds] = await Promise.all([fetchInstagramFeed(8), listInstagramEmbeds()]);
  if (!feed?.length && !embeds.length && !profileUrl) return null;
  const handle = profileUrl?.replace(/\/+$/, "").split("/").pop();

  return (
    <section className="py-20">
      <Container>
        <SectionHeading eyebrow="Instagram" title={handle ? `@${handle}` : "Siga a pousada"} text="Fotos e vídeos do dia a dia da pousada." align="center" />

        {feed?.length ? (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {feed.map((m) => (
              <li key={m.id} className="group relative aspect-square overflow-hidden rounded-xl bg-sand">
                <a href={m.permalink} target="_blank" rel="noreferrer" aria-label={m.caption?.slice(0, 80) ?? "Post no Instagram"}>
                  {m.type === "VIDEO" ? (
                    <video src={m.mediaUrl} poster={m.thumbnailUrl ?? undefined} muted playsInline loop autoPlay className="h-full w-full object-cover" />
                  ) : (
                    <Image src={m.mediaUrl} alt={m.caption?.slice(0, 80) ?? ""} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                  )}
                  {m.type === "VIDEO" ? <span className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white"><Play size={14} fill="currentColor" /></span> : null}
                </a>
              </li>
            ))}
          </ul>
        ) : embeds.length ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {embeds.map((p) => (
                <blockquote key={p.id} className="instagram-media w-full rounded-xl border border-sand-dark bg-white" data-instgrm-permalink={p.url} data-instgrm-version="14" style={{ minWidth: 0, margin: 0 }}>
                  <a href={p.url} target="_blank" rel="noreferrer" className="block p-6 text-center text-sm text-muted">Ver publicação no Instagram</a>
                </blockquote>
              ))}
            </div>
            <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
          </>
        ) : null}

        {profileUrl ? (
          <div className="mt-8 text-center">
            <a href={profileUrl} target="_blank" rel="noreferrer" className="btn-secondary"><InstagramIcon /> Seguir no Instagram</a>
          </div>
        ) : null}
      </Container>
    </section>
  );
}

import { asc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { instagramPosts } from "@/db/schema";

export type InstagramMedia = {
  id: string;
  type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  mediaUrl: string;
  thumbnailUrl: string | null;
  permalink: string;
  caption: string | null;
  timestamp: string;
};

const GRAPH = "https://graph.instagram.com";

/**
 * Feed via API oficial (Instagram Graph API / Instagram Login).
 * Requer INSTAGRAM_ACCESS_TOKEN (token de longa duração de conta Business/Creator).
 * Sem token, devolve null e o site usa os posts incorporados manualmente.
 * Cache de 1 hora para não estourar o limite da API.
 */
export async function fetchInstagramFeed(limit = 12): Promise<InstagramMedia[] | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return null;
  const fields = "id,media_type,media_url,thumbnail_url,permalink,caption,timestamp";
  try {
    const res = await fetch(`${GRAPH}/me/media?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(token)}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error("Instagram API", res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as { data?: Array<Record<string, string>> };
    return (json.data ?? []).map((m) => ({
      id: m.id,
      type: m.media_type as InstagramMedia["type"],
      mediaUrl: m.media_url,
      thumbnailUrl: m.thumbnail_url ?? null,
      permalink: m.permalink,
      caption: m.caption ?? null,
      timestamp: m.timestamp,
    }));
  } catch (e) {
    console.error("Instagram API", e);
    return null;
  }
}

export const listInstagramEmbeds = cache(async () =>
  db.select().from(instagramPosts).where(eq(instagramPosts.active, true)).orderBy(asc(instagramPosts.sortOrder)),
);

export function isInstagramPostUrl(url: string): boolean {
  return /^https:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv)\/[A-Za-z0-9_-]+\/?/.test(url);
}

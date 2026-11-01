import { db } from "@/db";
import { Card, Flash, PageTitle } from "@/components/admin/ui";
import { AccommodationForm } from "@/components/admin/accommodation-form";

export default async function NewAccommodation({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const amenities = await db.query.amenities.findMany();
  return (
    <>
      <PageTitle title="Nova acomodação" />
      <Flash erro={erro} />
      <Card><AccommodationForm amenities={amenities} selected={new Set()} /></Card>
    </>
  );
}

/* eslint-disable no-console */
// Seed de desenvolvimento. Dados de contato marcados como "A CONFIRMAR" são fictícios.
// Fotos são de demonstração (Unsplash) e devem ser substituídas pelas fotos autorizadas da pousada.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as s from "./schema";

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(sql, { schema: s });

const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

async function main() {
  const existing = await db.select({ id: s.establishments.id }).from(s.establishments).limit(1);
  if (existing.length) {
    console.log("Seed já aplicado; nada a fazer.");
    return;
  }

  const [est] = await db
    .insert(s.establishments)
    .values({
      name: "Pousada J Gostoso",
      tagline: "Sol, vento e mar em São Miguel do Gostoso",
      description:
        "Uma pousada acolhedora a poucos passos do mar, no litoral norte do Rio Grande do Norte. Quartos confortáveis, café da manhã regional e a tranquilidade de uma das praias mais charmosas do Nordeste.",
      phone: "(84) 99999-0000", // A CONFIRMAR
      whatsapp: "5584999990000", // A CONFIRMAR
      email: "contato@exemplo.com.br", // A CONFIRMAR
      addressLine: "Endereço a confirmar",
      city: "São Miguel do Gostoso",
      state: "RN",
      postalCode: "59585-000",
      latitude: -5.1225,
      longitude: -35.6353,
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=S%C3%A3o+Miguel+do+Gostoso+RN",
      instagramUrl: "https://www.instagram.com/jgostososmg",
      timezone: "America/Sao_Paulo",
    })
    .returning();

  await db.insert(s.siteSettings).values({
    establishmentId: est.id,
    logoUrl: "/brand/logo.jpg",
    primaryColor: "#C2410C", // laranja da marca
    accentColor: "#D4A017", // dourado da marca
    heroImageUrl: U("photo-1507525428034-b723cf961d3e"),
    heroTitle: "Sol, vento e mar em São Miguel do Gostoso",
    heroSubtitle: "Reserve direto com a pousada e viva dias tranquilos a poucos passos da praia.",
    aboutTitle: "Uma pousada feita para descansar",
    aboutText:
      "A Pousada J Gostoso nasceu do desejo de receber bem. Ficamos a poucos minutos a pé da praia, com quartos arejados, área de convivência e um café da manhã com sabores da região. Aqui o ritmo é o do mar.",
    cancellationPolicy:
      "Cancelamentos gratuitos até 7 dias antes do check-in. Após esse prazo, consulte a pousada. Política a confirmar pelo estabelecimento.",
    housePolicies:
      "Check-in a partir das 14h e check-out até as 12h. Não aceitamos animais. Ambiente para não fumantes.",
    privacyPolicy:
      "Os dados informados na solicitação de reserva são usados apenas para atendimento e comunicação sobre a estadia, conforme a LGPD (Lei 13.709/2018). Para excluir seus dados, entre em contato pelo e-mail da pousada.",
    termsText: "A solicitação de reserva não garante a hospedagem até a confirmação pela pousada.",
  });

  const amen = await db
    .insert(s.amenities)
    .values([
      { key: "wifi", label: "Wi-Fi", icon: "Wifi" },
      { key: "ar-condicionado", label: "Ar-condicionado", icon: "Snowflake" },
      { key: "tv", label: "TV", icon: "Tv" },
      { key: "frigobar", label: "Frigobar", icon: "Refrigerator" },
      { key: "cafe", label: "Café da manhã", icon: "Coffee" },
      { key: "varanda", label: "Varanda", icon: "Sun" },
      { key: "estacionamento", label: "Estacionamento", icon: "Car" },
      { key: "banheiro-privativo", label: "Banheiro privativo", icon: "ShowerHead" },
    ])
    .returning();
  const a = (k: string) => amen.find((x) => x.key === k)!.id;

  const types = await db
    .insert(s.accommodationTypes)
    .values([
      {
        slug: "quarto-standard",
        name: "Quarto Standard",
        shortDescription: "Conforto essencial para casais e viajantes.",
        description:
          "Quarto arejado com cama de casal, ar-condicionado e banheiro privativo. Ideal para quem passa o dia na praia e quer um bom descanso à noite.",
        capacity: 2,
        units: 4,
        basePriceCents: 22000,
        sizeM2: 18,
        bedDescription: "1 cama de casal",
        sortOrder: 1,
      },
      {
        slug: "suite-varanda",
        name: "Suíte com Varanda",
        shortDescription: "Rede na varanda e brisa do mar.",
        description:
          "Suíte espaçosa com varanda privativa e rede, cama queen, frigobar e TV. Perfeita para quem quer acompanhar o vento e o fim de tarde.",
        capacity: 3,
        units: 3,
        basePriceCents: 32000,
        sizeM2: 26,
        bedDescription: "1 cama queen + 1 solteiro",
        sortOrder: 2,
      },
      {
        slug: "suite-familia",
        name: "Suíte Família",
        shortDescription: "Espaço para até 4 pessoas.",
        description:
          "Suíte ampla com cama de casal e duas camas de solteiro, ar-condicionado e banheiro privativo. Pensada para famílias e grupos de amigos.",
        capacity: 4,
        units: 2,
        basePriceCents: 42000,
        sizeM2: 34,
        bedDescription: "1 cama de casal + 2 solteiro",
        sortOrder: 3,
      },
    ])
    .returning();
  const t = (slug: string) => types.find((x) => x.slug === slug)!.id;

  await db.insert(s.accommodationAmenities).values([
    ...["wifi", "ar-condicionado", "banheiro-privativo", "cafe"].map((k) => ({ accommodationTypeId: t("quarto-standard"), amenityId: a(k) })),
    ...["wifi", "ar-condicionado", "banheiro-privativo", "cafe", "tv", "frigobar", "varanda"].map((k) => ({ accommodationTypeId: t("suite-varanda"), amenityId: a(k) })),
    ...["wifi", "ar-condicionado", "banheiro-privativo", "cafe", "tv", "frigobar", "estacionamento"].map((k) => ({ accommodationTypeId: t("suite-familia"), amenityId: a(k) })),
  ]);

  await db.insert(s.accommodationImages).values([
    { accommodationTypeId: t("quarto-standard"), url: U("photo-1631049307264-da0ec9d70304"), alt: "Quarto Standard (foto de demonstração)", sortOrder: 0 },
    { accommodationTypeId: t("quarto-standard"), url: U("photo-1618773928121-c32242e63f39"), alt: "Detalhe do quarto (foto de demonstração)", sortOrder: 1 },
    { accommodationTypeId: t("suite-varanda"), url: U("photo-1590490360182-c33d57733427"), alt: "Suíte com Varanda (foto de demonstração)", sortOrder: 0 },
    { accommodationTypeId: t("suite-varanda"), url: U("photo-1502672260266-1c1ef2d93688"), alt: "Varanda com rede (foto de demonstração)", sortOrder: 1 },
    { accommodationTypeId: t("suite-familia"), url: U("photo-1566665797739-1674de7a421a"), alt: "Suíte Família (foto de demonstração)", sortOrder: 0 },
    { accommodationTypeId: t("suite-familia"), url: U("photo-1595576508898-0ad5c879a061"), alt: "Camas da suíte família (foto de demonstração)", sortOrder: 1 },
  ]);

  // Tarifa de alta temporada (exemplo): réveillon com mínimo de 3 noites.
  await db.insert(s.ratePlans).values([
    { accommodationTypeId: t("quarto-standard"), name: "Alta temporada réveillon", startDate: "2026-12-26", endDate: "2027-01-03", priceCents: 32000, minNights: 3, priority: 10 },
    { accommodationTypeId: t("suite-varanda"), name: "Alta temporada réveillon", startDate: "2026-12-26", endDate: "2027-01-03", priceCents: 45000, minNights: 3, priority: 10 },
    { accommodationTypeId: t("suite-familia"), name: "Alta temporada réveillon", startDate: "2026-12-26", endDate: "2027-01-03", priceCents: 58000, minNights: 3, priority: 10 },
  ]);

  await db.insert(s.galleryImages).values([
    { url: U("photo-1507525428034-b723cf961d3e"), alt: "Praia ao entardecer (demonstração)", category: "praia", sortOrder: 0 },
    { url: U("photo-1540541338287-41700207dee6"), alt: "Área da piscina (demonstração)", category: "lazer", sortOrder: 1 },
    { url: U("photo-1504280390367-361c6d9f38f4"), alt: "Café da manhã regional (demonstração)", category: "gastronomia", sortOrder: 2 },
    { url: U("photo-1520250497591-112f2f40a3f4"), alt: "Fachada da pousada (demonstração)", category: "estrutura", sortOrder: 3 },
  ]);

  await db.insert(s.experiences).values([
    { title: "Kitesurf e windsurf", description: "São Miguel do Gostoso é um dos melhores pontos de vento do Brasil. Indicamos escolas e aluguel de equipamentos.", imageUrl: U("photo-1502680390469-be75ac86ab6f"), sortOrder: 1 },
    { title: "Passeio de buggy", description: "Dunas, lagoas e praias desertas em um dia inteiro de passeio pelo litoral.", imageUrl: U("photo-1469854523086-cc02fe5d8800"), sortOrder: 2 },
    { title: "Pôr do sol na praia", description: "Fim de tarde na Praia do Cardeiro, a poucos minutos da pousada.", imageUrl: U("photo-1473116763249-2faaef81ccda"), sortOrder: 3 },
  ]);

  await db.insert(s.testimonials).values([
    { author: "Hóspede (exemplo)", text: "Depoimento de demonstração. Substitua por avaliações reais dos hóspedes.", rating: 5 },
  ]);

  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@exemplo.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin12345";
  await db.insert(s.adminUsers).values({
    email,
    name: "Administrador",
    passwordHash: await bcrypt.hash(password, 12),
    role: "OWNER",
  });

  console.log(`Seed aplicado. Admin: ${email} / senha definida em SEED_ADMIN_PASSWORD (padrão: admin12345).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => sql.end());

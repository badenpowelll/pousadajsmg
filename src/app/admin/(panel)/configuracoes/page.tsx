import { db } from "@/db";
import { Card, Flash, PageTitle } from "@/components/admin/ui";
import { getCurrentUser } from "@/lib/auth";
import { getSite } from "@/services/content";
import { changePassword, createStaff, saveEstablishment, saveSiteSettings } from "./actions";

function F({ label, name, value, type = "text", ...rest }: { label: string; name: string; value?: string | number | null; type?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "name" | "type">) {
  return <label><span className="label">{label}</span><input name={name} type={type} className="field" defaultValue={value ?? ""} {...rest} /></label>;
}
function T({ label, name, value, rows = 4 }: { label: string; name: string; value?: string | null; rows?: number }) {
  return <label><span className="label">{label}</span><textarea name={name} rows={rows} className="field" defaultValue={value ?? ""} /></label>;
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const [{ establishment: e, settings: s }, user, users] = await Promise.all([getSite(), getCurrentUser(), db.query.adminUsers.findMany()]);
  const owner = user?.role === "OWNER";
  return (
    <>
      <PageTitle title="Configurações" />
      <Flash ok={sp.ok} erro={sp.erro} />
      {!owner ? <p className="mb-4 text-sm text-muted">Apenas o proprietário altera dados do estabelecimento e do site.</p> : null}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-brown-dark">Estabelecimento</h2>
          <form action={saveEstablishment} className="grid gap-3 sm:grid-cols-2">
            <fieldset disabled={!owner} className="contents">
              <div className="sm:col-span-2"><F label="Nome" name="name" value={e.name} required /></div>
              <div className="sm:col-span-2"><F label="Slogan" name="tagline" value={e.tagline} /></div>
              <div className="sm:col-span-2"><T label="Descrição" name="description" value={e.description} rows={3} /></div>
              <F label="Telefone" name="phone" value={e.phone} />
              <F label="WhatsApp (só dígitos, com 55)" name="whatsapp" value={e.whatsapp} placeholder="5584999999999" />
              <F label="E-mail" name="email" value={e.email} type="email" />
              <F label="Instagram (URL)" name="instagramUrl" value={e.instagramUrl} />
              <F label="Facebook (URL)" name="facebookUrl" value={e.facebookUrl} />
              <F label="Endereço" name="addressLine" value={e.addressLine} />
              <F label="Cidade" name="city" value={e.city} />
              <F label="UF" name="state" value={e.state} maxLength={2} />
              <F label="CEP" name="postalCode" value={e.postalCode} />
              <F label="Latitude" name="latitude" value={e.latitude} type="number" step="any" />
              <F label="Longitude" name="longitude" value={e.longitude} type="number" step="any" />
              <div className="sm:col-span-2"><F label="Link do Google Maps" name="mapsUrl" value={e.mapsUrl} /></div>
              <F label="Check-in a partir de" name="checkInTime" value={e.checkInTime} type="time" required />
              <F label="Check-out até" name="checkOutTime" value={e.checkOutTime} type="time" required />
              <button className="btn-primary btn-sm sm:col-span-2">Salvar estabelecimento</button>
            </fieldset>
          </form>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-brown-dark">Site e identidade visual</h2>
          <form action={saveSiteSettings} className="grid gap-3 sm:grid-cols-2">
            <fieldset disabled={!owner} className="contents">
              <div className="sm:col-span-2"><F label="Logo (URL)" name="logoUrl" value={s.logoUrl} /></div>
              <div className="sm:col-span-2"><F label="Imagem principal (URL)" name="heroImageUrl" value={s.heroImageUrl} /></div>
              <div className="sm:col-span-2"><F label="Título principal" name="heroTitle" value={s.heroTitle} required /></div>
              <div className="sm:col-span-2"><F label="Subtítulo" name="heroSubtitle" value={s.heroSubtitle} /></div>
              <F label="Cor principal (botões)" name="primaryColor" value={s.primaryColor} type="color" />
              <F label="Cor de realce" name="accentColor" value={s.accentColor} type="color" />
              <div className="sm:col-span-2"><F label="Título da seção Sobre" name="aboutTitle" value={s.aboutTitle} /></div>
              <div className="sm:col-span-2"><T label="Texto Sobre" name="aboutText" value={s.aboutText} /></div>
              <div className="sm:col-span-2"><T label="Regras da casa" name="housePolicies" value={s.housePolicies} rows={3} /></div>
              <div className="sm:col-span-2"><T label="Política de cancelamento" name="cancellationPolicy" value={s.cancellationPolicy} rows={3} /></div>
              <div className="sm:col-span-2"><T label="Política de privacidade" name="privacyPolicy" value={s.privacyPolicy} rows={4} /></div>
              <div className="sm:col-span-2"><T label="Termos" name="termsText" value={s.termsText} rows={3} /></div>
              <button className="btn-primary btn-sm sm:col-span-2">Salvar site</button>
            </fieldset>
          </form>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-brown-dark">Minha senha</h2>
          <form action={changePassword} className="grid gap-3">
            <F label="Senha atual" name="current" type="password" required autoComplete="current-password" />
            <F label="Nova senha (mín. 10)" name="next" type="password" required autoComplete="new-password" />
            <F label="Confirmar nova senha" name="confirm" type="password" required autoComplete="new-password" />
            <button className="btn-secondary btn-sm">Alterar senha</button>
          </form>
        </Card>

        {owner ? (
          <Card>
            <h2 className="mb-3 font-semibold text-brown-dark">Usuários do painel</h2>
            <ul className="mb-4 text-sm">{users.map((u) => <li key={u.id}>{u.name} · {u.email} · {u.role === "OWNER" ? "Proprietário" : "Equipe"}{u.active ? "" : " (inativo)"}</li>)}</ul>
            <form action={createStaff} className="grid gap-3 sm:grid-cols-2">
              <F label="Nome" name="name" required />
              <F label="E-mail" name="email" type="email" required />
              <F label="Senha inicial (mín. 10)" name="password" type="password" required autoComplete="new-password" />
              <label><span className="label">Perfil</span><select name="role" className="field" defaultValue="STAFF"><option value="STAFF">Equipe</option><option value="OWNER">Proprietário</option></select></label>
              <button className="btn-secondary btn-sm sm:col-span-2">Criar usuário</button>
            </form>
          </Card>
        ) : null}
      </div>
    </>
  );
}

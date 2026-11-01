/** Link "click to chat" do WhatsApp. Não é integração com a API: apenas abre uma conversa. */
export function whatsappLink(number: string | null | undefined, message: string): string | null {
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

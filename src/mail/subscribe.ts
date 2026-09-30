const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isEmail = (value: string): boolean => EMAIL.test(value.trim());

/**
 * Add an address to the premiere mailing list via this site's /api/notify
 * route. Rejects on any failure so the form can show its retry message.
 * `website` is the form's hidden honeypot.
 */
export async function subscribe(email: string, website = ""): Promise<void> {
  const res = await fetch("/api/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), website }),
  });
  if (!res.ok) throw new Error(`Sign-up failed: ${res.status}`);
}

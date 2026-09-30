/**
 * Where a sign-up came from, read from the headers Vercel adds to every
 * request after looking up the visitor's IP. No third-party lookup, so
 * nothing extra is shared and nothing slows the response. IP-based location
 * is approximate: usually the right city, sometimes the ISP's nearest hub.
 * Off Vercel (local dev) the location headers are absent and it says so.
 */

export interface Visitor {
  ip: string;
  city: string;
  region: string;
  country: string;
  timezone: string;
  /** "lat,lon" when Vercel knows it, for a map link. */
  coords: string;
  /** One line, e.g. "Mumbai, MH, India". */
  place: string;
}

const UNKNOWN = "Unknown";

// Vercel URL-encodes city names so non-ASCII survives the header, e.g. "S%C3%A3o%20Paulo".
function header(req: Request, name: string): string {
  const raw = req.headers.get(name)?.trim();
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function countryName(code: string): string {
  if (!code) return "";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function visitorOf(req: Request): Visitor {
  // x-forwarded-for may be a chain "client, proxy1, proxy2"; the client is first.
  const ip =
    header(req, "x-forwarded-for").split(",")[0].trim() || header(req, "x-real-ip") || UNKNOWN;
  const city = header(req, "x-vercel-ip-city");
  const region = header(req, "x-vercel-ip-country-region");
  const country = countryName(header(req, "x-vercel-ip-country"));
  const lat = header(req, "x-vercel-ip-latitude");
  const lon = header(req, "x-vercel-ip-longitude");
  const place = [city, region, country].filter(Boolean).join(", ");

  return {
    ip,
    city: city || UNKNOWN,
    region: region || UNKNOWN,
    country: country || UNKNOWN,
    timezone: header(req, "x-vercel-ip-timezone") || UNKNOWN,
    coords: lat && lon ? `${lat},${lon}` : "",
    place: place || "Unknown (no location headers; not running on Vercel)",
  };
}

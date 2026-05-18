const isLocalHost = (hostname) =>
  hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';

/**
 * Normalize to origin only. Dev port is appended only for localhost without an explicit port.
 */
const normalizeOrigin = (base, devPort) => {
  if (!base) return null;

  try {
    const url = new URL(base);
    const hasExplicitPort = Boolean(url.port);

    if (!hasExplicitPort && isLocalHost(url.hostname) && devPort) {
      if (url.protocol === 'http:' && devPort !== '80') {
        url.port = devPort;
      }
    }

    return url.origin;
  } catch {
    return base.replace(/\/$/, '');
  }
};

/** API host (Vercel deployment URL or local backend) */
const getApiBaseUrl = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const port = String(process.env.PORT || 8000);
  return normalizeOrigin(process.env.API_URL, port) || `http://localhost:${port}`;
};

const DEFAULT_PRODUCTION_SITE = 'https://raimsoep.com';

/** Frontend host for QR codes (must match where users open /ec-card/verify/...) */
const getFrontendBaseUrl = () => {
  const configured =
    process.env.FRONTEND_URL || process.env.PUBLIC_URL || process.env.PUBLIC_SITE_URL;

  if (configured) {
    const vitePort = String(process.env.FRONTEND_DEV_PORT || 5173);
    return normalizeOrigin(configured, vitePort) || configured.replace(/\/$/, '');
  }

  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return DEFAULT_PRODUCTION_SITE;
  }

  const vitePort = String(process.env.FRONTEND_DEV_PORT || 5173);
  return normalizeOrigin('http://localhost', vitePort) || `http://localhost:${vitePort}`;
};

/** Public verification URL encoded in QR codes, e.g. https://raimsoep.com/ec-card/verify/RS-I-2026-6000089 */
const buildPublicPassportUrl = (clearanceId) => {
  const id = String(clearanceId || '').trim();
  if (!id) return null;
  return `${getFrontendBaseUrl()}/ec-card/verify/${encodeURIComponent(id)}`;
};

/** Legacy slug URLs for older printed QR codes */
const buildLegacySlugUrl = (slug) => `${getFrontendBaseUrl()}/passport/${slug}`;

module.exports = { getApiBaseUrl, getFrontendBaseUrl, buildPublicPassportUrl, buildLegacySlugUrl };

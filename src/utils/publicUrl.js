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

/** Frontend host for QR codes (Netlify or local Vite) */
const getFrontendBaseUrl = () => {
  const frontendUrl = process.env.FRONTEND_URL || process.env.PUBLIC_URL;
  if (frontendUrl) {
    const vitePort = String(process.env.FRONTEND_DEV_PORT || 5173);
    return normalizeOrigin(frontendUrl, vitePort) || frontendUrl.replace(/\/$/, '');
  }

  return getApiBaseUrl();
};

const buildPublicPassportUrl = (slug) => `${getFrontendBaseUrl()}/passport/${slug}`;

module.exports = { getApiBaseUrl, getFrontendBaseUrl, buildPublicPassportUrl };

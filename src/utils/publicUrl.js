const normalizeOrigin = (base, defaultPort) => {
  if (!base) return null;

  try {
    const url = new URL(base);
    const isDefaultHttpPort = url.protocol === 'http:' && (!url.port || url.port === '80');
    const isDefaultHttpsPort = url.protocol === 'https:' && (!url.port || url.port === '443');

    if (defaultPort && isDefaultHttpPort && defaultPort !== '80') {
      url.port = defaultPort;
    } else if (defaultPort && isDefaultHttpsPort && defaultPort !== '443') {
      url.port = defaultPort;
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
  const port = String(process.env.PORT || 8000);
  return normalizeOrigin(process.env.FRONTEND_URL || process.env.PUBLIC_URL, port) || getApiBaseUrl();
};

const buildPublicPassportUrl = (slug) => `${getFrontendBaseUrl()}/passport/${slug}`;

module.exports = { getApiBaseUrl, getFrontendBaseUrl, buildPublicPassportUrl };

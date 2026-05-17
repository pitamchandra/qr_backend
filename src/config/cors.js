const getCorsOptions = () => {
  const origins = new Set();

  [process.env.FRONTEND_URL, process.env.PUBLIC_URL, process.env.CORS_ORIGIN].forEach((value) => {
    if (!value) return;
    value.split(',').forEach((entry) => {
      const trimmed = entry.trim();
      if (!trimmed) return;
      try {
        origins.add(new URL(trimmed).origin);
      } catch {
        origins.add(trimmed.replace(/\/$/, ''));
      }
    });
  });

  if (origins.size === 0) {
    return { origin: true, credentials: true };
  }

  return {
    origin(origin, callback) {
      if (!origin || origins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  };
};

module.exports = { getCorsOptions };

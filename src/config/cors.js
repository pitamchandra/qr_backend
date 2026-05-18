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

  origins.add('https://raimsoep.com');

  if (origins.size === 0) {
    return {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      optionsSuccessStatus: 200,
    };
  }

  return {
    origin(origin, callback) {
      if (!origin || origins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  };
};

module.exports = { getCorsOptions };

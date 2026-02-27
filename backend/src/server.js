const http = require('http');
const app = require('./app');
const { connectToMongo } = require('./config/db');
const { bootstrapAdmin } = require('./config/bootstrapAdmin');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectToMongo();
  await bootstrapAdmin();

  const server = http.createServer(app);

  server.listen(PORT, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(`[backend] listening on 0.0.0.0:${PORT}`);
  });

  const shutdown = async (signal) => {
    // eslint-disable-next-line no-console
    console.log(`[backend] received ${signal}, shutting down...`);
    server.close(() => {
      // eslint-disable-next-line no-console
      console.log('[backend] http server closed');
      process.exit(0);
    });

    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.error('[backend] forced shutdown');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[backend] failed to start', err);
  process.exit(1);
});

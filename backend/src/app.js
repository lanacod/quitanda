const express = require('express');
const cors = require('cors');

const routes = require('./routes');

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || '*';
const origins =
  corsOrigin === '*'
    ? true
    : corsOrigin.split(',').map((o) => o.trim()).filter(Boolean);
app.use(
  cors({
    origin: origins,
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(routes);

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';
  res.status(status).json({ erro: message });
});

module.exports = app;

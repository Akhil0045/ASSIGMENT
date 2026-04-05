const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const swaggerPath = path.join(__dirname, 'docs/swagger.yaml');
const baseSwagger = YAML.load(swaggerPath);

function getSwaggerDocument() {
  const doc = JSON.parse(JSON.stringify(baseSwagger));
  const publicBase = process.env.API_PUBLIC_URL || process.env.RENDER_EXTERNAL_URL;
  if (publicBase) {
    const root = publicBase.replace(/\/$/, '');
    doc.servers = [
      { url: `${root}/api`, description: 'Deployed API' },
      ...(baseSwagger.servers || []),
    ];
  }
  return doc;
}
// Routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { errorHandler } = require('./middlewares/errorHandler');
const { apiLimiter, authLimiter } = require('./middlewares/rateLimiter');

const app = express();

if (process.env.RENDER || process.env.RENDER_EXTERNAL_URL) {
  app.set('trust proxy', 1);
}

// Security Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// Swagger API Docs
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(getSwaggerDocument(), {
    customSiteTitle: 'FinanceOS API Docs',
    swaggerOptions: { persistAuthorization: true },
  }),
);

app.get('/', (req, res) => {
  res.redirect(302, '/api-docs');
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});


// Logger
app.use(morgan('dev'));

// Rate Limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;

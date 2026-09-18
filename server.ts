import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

// Seed initial database
import { seedDatabaseIfEmpty } from './server/database/seed';
import { errorHandler } from './server/middleware/errorHandler';

// Import Route Handlers
import authRoutes from './server/routes/authRoutes';
import businessRoutes from './server/routes/businessRoutes';
import dashboardRoutes from './server/routes/dashboardRoutes';
import productRoutes from './server/routes/productRoutes';
import inventoryRoutes from './server/routes/inventoryRoutes';
import salesRoutes from './server/routes/salesRoutes';
import purchaseRoutes from './server/routes/purchaseRoutes';
import customerRoutes from './server/routes/customerRoutes';
import supplierRoutes from './server/routes/supplierRoutes';
import creditRoutes from './server/routes/creditRoutes';
import expenseRoutes from './server/routes/expenseRoutes';
import financialRoutes from './server/routes/financialRoutes';
import memoryRoutes from './server/routes/memoryRoutes';
import schemeRoutes from './server/routes/schemeRoutes';
import marketRoutes from './server/routes/marketRoutes';
import alertRoutes from './server/routes/alertRoutes';
import reportRoutes from './server/routes/reportRoutes';
import assistantRoutes from './server/routes/assistantRoutes';
import healthRoutes from './server/routes/healthRoutes';
import demoRoutes from './server/routes/demoRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize and seed database if empty
  await seedDatabaseIfEmpty();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Basic CORS headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // --- API Routes ---
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/business', businessRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/sales', salesRoutes);
  app.use('/api/purchases', purchaseRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/suppliers', supplierRoutes);
  app.use('/api/credit', creditRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/financial', financialRoutes);
  app.use('/api/memory', memoryRoutes);
  app.use('/api/schemes', schemeRoutes);
  app.use('/api/market', marketRoutes);
  app.use('/api/alerts', alertRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/assistant', assistantRoutes);
  app.use('/api/demo', demoRoutes);

  // Centralized Error Handling for API
  app.use(errorHandler);

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[URIMAIYALAR AI] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[URIMAIYALAR AI] Startup failure:', err);
  process.exit(1);
});

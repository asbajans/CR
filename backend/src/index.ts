import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { seedDatabase } from './lib/seed';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import patientRoutes from './routes/patients';
import appointmentRoutes from './routes/appointments';
import leadRoutes from './routes/leads';
import campaignRoutes from './routes/campaigns';
import treatmentRoutes from './routes/treatment';
import invoiceRoutes from './routes/invoices';
import webhookRoutes from './routes/webhooks';
import dashboardRoutes from './routes/dashboard';
import visitRoutes from './routes/visits';
import reportRoutes from './routes/reports';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'crdent-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/treatment', treatmentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/reports', reportRoutes);

app.use(errorHandler);

async function start() {
  try {
    await seedDatabase();
  } catch (error) {
    console.error('[seed] demo veri yüklenemedi:', error);
  }
  app.listen(PORT, () => {
    console.log(`CRDent Backend running on http://localhost:${PORT}`);
  });
}

start();

export default app;

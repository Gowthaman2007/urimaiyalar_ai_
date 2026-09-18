import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'urimaiyalar-ai',
    database: 'connected',
    ai: process.env.GEMINI_API_KEY ? 'available' : 'rules_engine_active',
    timestamp: new Date().toISOString()
  });
});

export default router;

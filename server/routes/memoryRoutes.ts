import { Router, Response } from 'express';
import { authMiddleware, requireBusiness, AuthRequest } from '../middleware/auth';
import { MemoryService } from '../services/memoryService';
import { MemoryType } from '../types';

const router = Router();
router.use(authMiddleware, requireBusiness);

router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const type = req.query.type as MemoryType;
    const importance = req.query.importance as string;
    const search = req.query.search as string;

    const memories = MemoryService.getMemories(req.businessId!, type, importance, search);
    res.json({
      success: true,
      data: memories
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'MEMORY_FETCH_ERROR' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { type, title, content, tamilContent, importance, metadata } = req.body;
    if (!title || !content || !type) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, and content are required.',
        code: 'VALIDATION_ERROR'
      });
    }

    const memory = await MemoryService.createMemory(req.businessId!, {
      type,
      title,
      content,
      tamilContent,
      source: 'USER_NOTE',
      importance: importance || 'MEDIUM',
      metadata
    });

    res.status(201).json({
      success: true,
      data: memory
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, code: 'MEMORY_CREATE_ERROR' });
  }
});

export default router;

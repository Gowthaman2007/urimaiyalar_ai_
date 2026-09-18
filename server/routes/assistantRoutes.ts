import { Router, Response } from 'express';
import { authMiddleware, requireBusiness, AuthRequest } from '../middleware/auth';
import { aiOrchestrator } from '../ai/AIOrchestrator';
import { db } from '../database/db';

const router = Router();
router.use(authMiddleware, requireBusiness);

// Process user natural language query (Tamil, Tanglish, English, or Voice transcript)
router.post('/query', async (req: AuthRequest, res: Response) => {
  try {
    const { query, conversationId } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query text is required.',
        code: 'QUERY_REQUIRED'
      });
    }

    const business = db.businesses.find(b => b.id === req.businessId!)!;

    const result = await aiOrchestrator.processUserMessage(
      query.trim(),
      {
        businessId: business.id,
        businessName: business.businessName,
        ownerName: business.ownerName,
        category: business.category,
        currency: business.currency,
        language: business.preferredLanguage
      },
      conversationId
    );

    res.json({
      success: true,
      data: result
    });
  } catch (err: any) {
    console.error('Assistant error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'AI Assistant processing failed.',
      code: 'AI_ASSISTANT_ERROR'
    });
  }
});

// List conversations
router.get('/conversations', (req: AuthRequest, res: Response) => {
  try {
    const conversations = db.aiConversations
      .filter(c => c.businessId === req.businessId!)
      .map(c => ({
        id: c.id,
        title: c.title,
        messageCount: c.messages.length,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      }));

    res.json({
      success: true,
      data: conversations
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'CONVERSATIONS_ERROR' });
  }
});

// Get single conversation details
router.get('/conversations/:id', (req: AuthRequest, res: Response) => {
  const conv = db.aiConversations.find(c => c.id === req.params.id && c.businessId === req.businessId!);
  if (!conv) {
    return res.status(404).json({ success: false, message: 'Conversation not found.', code: 'NOT_FOUND' });
  }
  res.json({ success: true, data: conv });
});

export default router;

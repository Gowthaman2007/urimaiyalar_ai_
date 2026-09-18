import { Router, Request, Response } from 'express';
import { db } from '../database/db';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const search = req.query.search as string;
    let schemes = db.governmentSchemes.filter(s => s.active);

    if (category && category !== 'ALL') {
      schemes = schemes.filter(s => s.businessCategory.some(c => c.toLowerCase().includes(category.toLowerCase())));
    }

    if (search) {
      const q = search.toLowerCase();
      schemes = schemes.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.tamilName.toLowerCase().includes(q) || 
        s.code.toLowerCase().includes(q) ||
        s.eligibility.toLowerCase().includes(q) ||
        s.eligibilityTamil.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      data: schemes
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'SCHEMES_ERROR' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  const scheme = db.governmentSchemes.find(s => s.id === req.params.id);
  if (!scheme) {
    return res.status(404).json({ success: false, message: 'Scheme not found.', code: 'NOT_FOUND' });
  }
  res.json({ success: true, data: scheme });
});

export default router;

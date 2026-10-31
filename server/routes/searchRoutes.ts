import { Router } from 'express';
import { search, getSuggestions, getSearchHistory } from '../controllers/searchController.ts';

const router = Router();

router.get('/', search);
router.get('/suggestions', getSuggestions);
router.get('/history', getSearchHistory);

export default router;

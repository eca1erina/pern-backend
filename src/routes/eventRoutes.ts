import { Router } from 'express';
import { getUsers, signupUser } from '@controllers/eventController';

const router = Router();

router.get('/', getUsers);
router.post('/signup', signupUser);

export default router;

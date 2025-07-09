import { Router } from 'express';
import { getUsers, signupUser, loginUser, getCurrentUser } from '@controllers/eventController';

const router = Router();

router.get('/', getUsers);
router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/:id', getCurrentUser);

export default router;

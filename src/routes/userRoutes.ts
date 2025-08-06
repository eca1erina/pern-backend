import { Router } from 'express';
import { getUsers, signupUser, loginUser, getCurrentUser, updateUser } from '../controllers/userController';

const router = Router();

router.get('/', getUsers);
router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/:id', getCurrentUser);
router.put('/:id', updateUser);

export default router;

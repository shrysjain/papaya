import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signToken } from './utils/auth';
import { authenticate } from './utils/authMiddleware';
import dotenv from 'dotenv';
import { Context } from './utils/types';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;
const prisma = new PrismaClient();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const token = signToken(user);

    res.json({ message: 'User registered successfully', user, token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password '});
    }

    const token = signToken(user);

    res.json({ message: 'User logged in successfully', user, token })
  } catch (error) {
    res.status(500).json({ error: 'Failed to log in user' });
  }
});

app.post('/notes', authenticate, async (req, res) => {
  const { title, content } = req.body;
  const { userId } = req;

  try {
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        authorId: userId,
      },
    });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.get('/notes', authenticate, async (req, res) => {
  const { userId } = req;

  try {
    const notes = await prisma.note.findMany({
      where: { authorId: userId },
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve notes' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

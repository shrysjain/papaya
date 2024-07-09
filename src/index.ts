import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signToken } from './utils/auth';
import { authenticate } from './utils/authMiddleware';
import dotenv from 'dotenv';
import { Context } from './utils/types';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;
app.use(cors({ origin: 'http://localhost:3000' }));
const prisma = new PrismaClient();

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`<h2>Papaya Server</h2>Listening on port ${port}<h3>Endpoints</h3>POST /register<br>POST /login<br>POST /notes<br>GET /notes<br>PUT /notes/:id<br>DELETE /notes/:id<br>POST /update-password<br>GET /profile<br>PUT /profile<br>GET /notes/search<br>PUT /notes/:id/star<br>POST /notes/:id/share<br><br><i>All operations except </i><b>POST /register</b><i> require the </i><b>Authorization</b><i> header set to </i><b>Bearer &lt;JWT_TOKEN&gt;</b>`);
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
    const userNotes = await prisma.note.findMany({
      where: { authorId: userId },
    });

    const sharedNotes = await prisma.sharedNote.findMany({
      where: { userId },
      include: {
        note: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const formattedSharedNotes = sharedNotes.map(shared => ({
      ...shared.note,
    }));

    const allNotes = [...userNotes, ...formattedSharedNotes];
    
    res.json(allNotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve notes' });
  }
});

app.put('/notes/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const { userId } = req;

  try {
    const note = await prisma.note.findUnique({
      where: { id: Number(id) },
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.authorId != userId) {
      return res.status(404).json({ error: 'Not authorized to edit this note' })
    }

    const updatedNote = await prisma.note.update({
      where: { id: Number(id) },
      data: { title, content }
    });

    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

app.delete('/notes/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { userId } = req;

  try {
    const note = await prisma.note.findUnique({
      where: { id: Number(id) },
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.authorId != userId) {
      return res.status(404).json({ error: 'Not authorized to edit this note' })
    }

    await prisma.note.delete({
      where: { id: Number(id) },
    });

    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

app.post('/update-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { userId } = req;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.json({ message: 'Password changed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

app.get('/profile', authenticate, async (req, res) => {
  const { userId } = req;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

app.put('/profile', authenticate, async (req, res) => {
  const { email } = req.body;
  const { userId } = req;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.get('/notes/search', authenticate, async (req, res) => {
  const { query } = req.body;
  const { userId } = req;

  try {
    const notes = await prisma.note.findMany({
      where: {
        authorId: userId,
        OR: [
          {
            title: {
              contains: query as string,
              mode: 'insensitive',
            },
          },
          {
            content: {
              contains: query as string,
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search notes' });
  }
});

app.put('/notes/:id/star', authenticate, async (req, res) => {
  const { id } = req.params;
  const { userId } = req;

  try {
    const note = await prisma.note.findUnique({
      where: { id: Number(id) },
    });

    if (!note || note.authorId !== userId) {
      return res.status(404).json({ error: 'Note not found or not authorized' });
    }

    const updatedNote = await prisma.note.update({
      where: { id: Number(id) },
      data: { starred: !note.starred },
    });

    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to star note' });
  }
});

app.post('/notes/:id/share', authenticate, async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  const { userId } = req;

  try {
    const note = await prisma.note.findUnique({
      where: { id: Number(id) },
    });

    if (!note || note.authorId != userId) {
      return res.status(404).json({ error: 'Note not found or not authorized' });
    }

    const userToShareWith = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToShareWith) {
      return res.status(404).json({ error: 'User to share with not found' });
    }

    const sharedNote = await prisma.sharedNote.create({
      data: {
        noteId: note.id,
        userId: userToShareWith.id,
      },
    });

    res.json({ message: 'Note shared successfully', sharedNote });
  } catch (error) {
    res.status(500).json({ error: 'Failed to share note' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

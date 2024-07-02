import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const port = process.env.PORT || 3001;
const prisma = new PrismaClient();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/users', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.post('/notes', async (req, res) => {
  const { title, content, authorId } = req.body;
  try {
    const note = await prisma.note.create({
      data: {
        title,
        content,
        authorId,
      },
    });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

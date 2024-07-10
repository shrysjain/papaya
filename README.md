# Papaya

Papaya is a collaborative notes application built with TypeScript, JWT/Bcrypt, Express, Prisma, and PostgreSQL. It allows users to register, log in, create, update, delete, and share notes with other users. Users can also manage their profiles, update passwords, and search for notes.

## Endpoints

### Register a new user

**POST** `/register`

Request Body:
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "token": "your_jwt_token"
}
```

### Log in a user

**POST** `/login`

Request Body:
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

Response:
```json
{
  "message": "User logged in successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "token": "your_jwt_token"
}
```

### Create a new note

**POST** `/notes`

Request Headers:
```
Authorization: Bearer <JWT_TOKEN>
```

Request Body:
```json
{
  "title": "My Note",
  "content": "This is the content of the note."
}
```

Response:
```json
{
  "id": 1,
  "title": "My Note",
  "content": "This is the content of the note.",
  "authorId": 1,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Get all notes

**GET** `/notes`

Request Headers:
```
Authorization: Bearer <JWT_TOKEN>
```

Response:
```json
[
  {
    "id": 1,
    "title": "My Note",
    "content": "This is the content of the note.",
    "authorId": 1,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### Update a note

**PUT** `/notes/:id`

Request Headers:
```
Authorization: Bearer <JWT_TOKEN>
```

Request Body:
```json
{
  "title": "Updated Note",
  "content": "This is the updated content of the note."
}
```

Response:
```json
{
  "id": 1,
  "title": "Updated Note",
  "content": "This is the updated content of the note.",
  "authorId": 1,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Delete a note

**DELETE** `/notes/:id`

Request Headers:
```
Authorization: Bearer <JWT_TOKEN>
```

Response:
```json
{
  "message": "Note deleted"
}
```

### Update password

**POST** `/update-password`

Request Headers
```
Authorization: Bearer <JWT_TOKEN>
```

Request Body:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

Response:
```json
{
  "message": "Password changed"
}
```

### Get user profile

**GET** `/profile`

Request Headers:
```
Authorization: Bearer <JWT_TOKEN>
```

Response:
```json
{
  "id": 1,
  "email": "user@example.com",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Update user profile

**PUT** `/profile`

Request Headers:
```
Authorization: Bearer <JWT_TOKEN>
```

Request Body:
```json
{
  "email": "newemail@example.com"
}
```

Response:
```json
{
  "id": 1,
  "email": "newemail@example.com",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Search notes

**GET** `/notes/search`

Request Headers:
```
Authorization: Bearer <JWT_TOKEN>
```

Request Body:
```json
{
  "query": "Test"
}
```

Response:
```json
[
  {
    "id": 1,
    "title": "My Note",
    "content": "This note contains the word Test",
    "authorId": 1,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### Star a note

**PUT** `/notes/:id/star`

Request Headers:
```
Authorization: Bearer <JWT_TOKEN>
```

Response:
```json
{
  "id": 1,
  "title": "My Note",
  "content": "This is the content of the note.",
  "authorId": 1,
  "starred": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Share a note

**POST** `/notes/:id/share`

Request Headers:
```
Authorization: Bearer <JWT_TOKEN>
```

Request Body:
```json
{
  "email": "shareduser@example.com"
}
```

Response:
```json
{
  "message": "Note shared successfully",
  "sharedNote": {
    "noteId": 1,
    "userId": 2
  }
}
```

## Built With

- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL

### Installation

1. Clone the repository:
```sh
git clone https://github.com/shrysjain/papaya.git
cd papaya
```
*Alternatively, clone via SSH, the GitHub CLI, or GitHub desktop*

2. Install dependencies
```sh
npm install
```

3. Set up the environment variables:
Create a `.env` file in the root of your project and add the following:
```env
DATABASE_URL="your_postgresql_database_url"
PORT=server_port
JWT_SECRET=your_jwt_secret
# ^ This key can be generated with an output from `openssl rand -base64 32`
```

4. Migrate the database schema
```sh
npx prisma migrate --dev name init
```

5. Start the development server
```sh
npm run dev
```

## Accessing the Endpoints

Use tools like Postman or Insomnia to interact with the API. Ensure you include the `Authorization` header with the JWT token for protected routes (all except `/register`).

## Contributing

1. Fork the repository
2. Create your feature branch
```sh
git checkout -b feature/your-feature
```
3. Commit your changes
4. Push to the branch
```sh
git push origin feature/your-feature
```
5. Open a pull request

## Licensing

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](./LICENSE) file for details.

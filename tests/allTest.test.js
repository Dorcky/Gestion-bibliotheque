import request from 'supertest';
import app from '../app.js';
import sequelize from '../config/database.js';
import { Livre, Auteur, Utilisateur } from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Avant tous les tests, synchroniser la base de données en mode force (supprime et recrée toutes les tables)
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

// Après tous les tests, fermer la connexion à la base de données
afterAll(async () => {
  await sequelize.close();
});

// Tests pour l'authentification et les opérations CRUD des utilisateurs
describe('User Authentication and CRUD', () => {
  let userToken, adminToken, userId;

  // Test d'enregistrement d'un nouvel utilisateur
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/utilisateurs/register')
      .send({
        email: 'user@example.com',
        motDePasse: 'password123',
        role: 'utilisateur'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Utilisateur créé avec succès.');
  });

  // Test d'enregistrement d'un utilisateur admin
  it('should register an admin user', async () => {
    const res = await request(app)
      .post('/api/utilisateurs/register')
      .send({
        email: 'admin@example.com',
        motDePasse: 'adminpass123',
        role: 'admin'
      });
    expect(res.statusCode).toBe(201);
  });

  // Test de connexion en tant qu'utilisateur normal
  it('should login as user', async () => {
    const res = await request(app)
      .post('/api/utilisateurs/login')
      .send({
        email: 'user@example.com',
        motDePasse: 'password123'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    userToken = res.body.token;
  });

  // Test de connexion en tant qu'admin
  it('should login as admin', async () => {
    const res = await request(app)
      .post('/api/utilisateurs/login')
      .send({
        email: 'admin@example.com',
        motDePasse: 'adminpass123'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    adminToken = res.body.token;
  });

  // Test pour obtenir le profil de l'utilisateur
  it('should get user profile', async () => {
    const res = await request(app)
      .get('/api/utilisateurs/profile')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('role');
    expect(res.body).not.toHaveProperty('motDePasse');
  });

  // Test : un utilisateur normal ne peut pas mettre à jour un autre utilisateur
  it('should not allow regular user to update another user', async () => {
    const user = await Utilisateur.findOne({ where: { email: 'admin@example.com' } });
    userId = user.id;
    const res = await request(app)
      .put(`/api/utilisateurs/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        email: 'newemail@example.com'
      });
    expect(res.statusCode).toBe(403);
  });

  // Test : un admin peut mettre à jour un utilisateur
  it('should allow admin to update a user', async () => {
    const res = await request(app)
      .put(`/api/utilisateurs/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'updatedemail@example.com'
      });
    expect(res.statusCode).toBe(200);
  });

  // Test : un utilisateur normal ne peut pas supprimer un utilisateur
  it('should not allow regular user to delete a user', async () => {
    const res = await request(app)
      .delete(`/api/utilisateurs/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });

  // Test : un admin peut supprimer un utilisateur
  it('should allow admin to delete a user', async () => {
    const res = await request(app)
      .delete(`/api/utilisateurs/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });
});

// Tests pour obtenir tous les utilisateurs
describe('Get All Users', () => {
  let adminToken;

  // Avant tous les tests, créer un utilisateur admin pour les tests
  beforeAll(async () => {
    const admin = await Utilisateur.create({
      email: 'admin_get_users@test.com',
      motDePasse: await bcrypt.hash('adminpass123', 10),
      role: 'admin'
    });
    adminToken = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET || 'a78oiu8',
      { expiresIn: '1h' }
    );
  });

  // Test : un admin peut obtenir tous les utilisateurs
  it('should allow admin to get all users', async () => {
    const res = await request(app)
      .get('/api/utilisateurs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0); // S'assurer qu'il y a des utilisateurs
    expect(res.body[0]).toHaveProperty('email'); // Vérifier que chaque utilisateur a une propriété email
  });

  // Test : un utilisateur normal ne peut pas obtenir tous les utilisateurs
  it('should not allow regular user to get all users', async () => {
    const user = await Utilisateur.create({
      email: 'user_get_users@test.com',
      motDePasse: await bcrypt.hash('password123', 10),
      role: 'utilisateur'
    });
    const userToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'a78oiu8',
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/utilisateurs')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403); // Vérifier que l'accès est refusé
  });
});


// Tests pour les opérations sur les auteurs
describe('Author Operations', () => {
  let userToken, adminToken, authorId;

  // Avant tous les tests de cette suite, créer un utilisateur et un admin pour les tests
  beforeAll(async () => {
    const user = await Utilisateur.create({
      email: 'author_user@test.com',
      motDePasse: await bcrypt.hash('password123', 10),
      role: 'utilisateur'
    });
    userToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'a78oiu8',
      { expiresIn: '1h' }
    );

    const admin = await Utilisateur.create({
      email: 'author_admin@test.com',
      motDePasse: await bcrypt.hash('adminpass123', 10),
      role: 'admin'
    });
    adminToken = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET || 'a78oiu8',
      { expiresIn: '1h' }
    );
  });

  // Test : un utilisateur peut créer un nouvel auteur
  it('should allow user to create a new author', async () => {
    const res = await request(app)
      .post('/api/auteurs')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        nom: 'John Doe',
        biographie: 'A famous author'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    authorId = res.body.id;
  });

  // Test : un utilisateur peut obtenir un auteur par son ID
  it('should allow user to get an author by id', async () => {
    const res = await request(app)
      .get(`/api/auteurs/${authorId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.nom).toBe('John Doe');
  });

  // Test : un utilisateur peut mettre à jour un auteur
  it('should allow user to update an author', async () => {
    const res = await request(app)
      .put(`/api/auteurs/${authorId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        nom: 'Jane Doe',
        biographie: 'An updated biography'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.nom).toBe('Jane Doe');
  });

  // Test : un utilisateur peut supprimer un auteur
  it('should allow user to delete an author', async () => {
    const res = await request(app)
      .delete(`/api/auteurs/${authorId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
  });
});

// Tests pour les opérations sur les livres
describe('Book Operations', () => {
  let userToken, adminToken, bookId, authorId;

  // Avant tous les tests de cette suite, créer un utilisateur, un admin et un auteur pour les tests
  beforeAll(async () => {
    const user = await Utilisateur.create({
      email: 'book_user@test.com',
      motDePasse: await bcrypt.hash('password123', 10),
      role: 'utilisateur'
    });
    userToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'a78oiu8',
      { expiresIn: '1h' }
    );

    const admin = await Utilisateur.create({
      email: 'book_admin@test.com',
      motDePasse: await bcrypt.hash('adminpass123', 10),
      role: 'admin'
    });
    adminToken = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET || 'a78oiu8',
      { expiresIn: '1h' }
    );

    const author = await Auteur.create({
      nom: 'Book Author',
      biographie: 'Writes books'
    });
    authorId = author.id;
  });

  // Test : un utilisateur peut créer un nouveau livre
  it('should allow user to create a new book', async () => {
    const res = await request(app)
      .post('/api/livres')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        titre: 'Test Book',
        auteurId: authorId,
        annee: 2023,
        genre: 'Fiction'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    bookId = res.body.id;
  });

  // Test : un utilisateur peut obtenir un livre par son ID
  it('should allow user to get a book by id', async () => {
    const res = await request(app)
      .get(`/api/livres/${bookId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.titre).toBe('Test Book');
  });

  // Test : un utilisateur peut mettre à jour un livre
  it('should allow user to update a book', async () => {
    const res = await request(app)
      .put(`/api/livres/${bookId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        titre: 'Updated Book Title',
        annee: 2024
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.titre).toBe('Updated Book Title');
  });

  // Test : un utilisateur peut supprimer un livre
  it('should allow user to delete a book', async () => {
    const res = await request(app)
      .delete(`/api/livres/${bookId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Livre supprimé avec succès');
  });
});


import Utilisateur from '../models/utilisateur.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Fonction d'enregistrement (Register)
export const register = async (req, res) => {
  const { email, motDePasse, role } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    const utilisateurExistant = await Utilisateur.findOne({ where: { email } });
    if (utilisateurExistant) {
      return res.status(400).json({ message: 'L\'email est déjà utilisé.' });
    }

    // Créer un nouvel utilisateur
    const nouvelUtilisateur = await Utilisateur.create({
      email,
      motDePasse, // Le mot de passe sera automatiquement haché dans le hook beforeCreate
      role
    });

    return res.status(201).json({ message: 'Utilisateur créé avec succès.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// Fonction de connexion (Login)
export const login = async (req, res) => {
    const { email, motDePasse } = req.body;
  
    try {
      // Chercher l'utilisateur par email
      const utilisateur = await Utilisateur.findOne({ where: { email } });
  
      if (!utilisateur) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
      }
  
      // Comparer les mots de passe
      const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
  
      if (!motDePasseValide) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
      }
  
      // Créer un token JWT
      const token = jwt.sign(
        { id: utilisateur.id, role: utilisateur.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      return res.status(200).json({
        message: 'Connexion réussie.',
        token
      });
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur.' });
    }
  };

// Fonction de mise à jour utilisateur (PUT)
export const updateUser = async (req, res) => {
  const utilisateurId = req.params.id;
  const { email, motDePasse } = req.body;

  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé. Seuls les administrateurs peuvent modifier les utilisateurs.' });
    }

    // Trouver l'utilisateur par ID
    const utilisateur = await Utilisateur.findByPk(utilisateurId);

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Mettre à jour les champs
    if (email) utilisateur.email = email;
    if (motDePasse) utilisateur.motDePasse = await bcrypt.hash(motDePasse, 10);

    await utilisateur.save();

    return res.status(200).json({ message: 'Utilisateur mis à jour avec succès.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// Fonction de suppression d'utilisateur (DELETE)
export const deleteUser = async (req, res) => {
  const utilisateurId = req.params.id;

  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé. Seuls les administrateurs peuvent supprimer des utilisateurs.' });
    }

    // Trouver l'utilisateur par ID
    const utilisateur = await Utilisateur.findByPk(utilisateurId);

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Supprimer l'utilisateur
    await utilisateur.destroy();

    return res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// obtenir les utilisateurs
export const getUsers = async (req, res) => {
  try {
    const users = await Utilisateur.findAll(); // Assurez-vous que c'est bien Utilisateur
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
  }
};



// Fonction pour obtenir le profil de l'utilisateur
export const getProfile = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.user.id, {
      attributes: ['id', 'email', 'role'] // N'incluez pas le mot de passe
    });

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.status(200).json(utilisateur);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du profil.' });
  }
};
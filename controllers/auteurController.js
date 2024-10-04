import { Auteur, Livre } from '../models/index.js';

// Récupère tous les auteurs
export const getAllAuteurs = async (req, res) => {
  try {
    const auteurs = await Auteur.findAll();
    res.status(200).json(auteurs);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des auteurs', error: error.message });
  }
};

// Récupère un auteur par son ID
export const getAuteurById = async (req, res) => {
    const { id } = req.params;
    try {
      const auteur = await Auteur.findByPk(id, {
        include: [{ model: Livre, as: 'Livres' }]
      });
      if (auteur) {
        res.status(200).json(auteur);
      } else {
        res.status(404).json({ message: 'Auteur non trouvé' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'auteur', error: error.message });
    }
  };

// Crée un nouvel auteur
export const createAuteur = async (req, res) => {
  const { nom, biographie } = req.body;
  try {
    const newAuteur = await Auteur.create({ nom, biographie });
    res.status(201).json(newAuteur);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'auteur', error: error.message });
  }
};

// Met à jour un auteur existant
export const updateAuteur = async (req, res) => {
  const { id } = req.params;
  const { nom, biographie } = req.body;
  try {
    const auteur = await Auteur.findByPk(id);
    if (auteur) {
      await auteur.update({ nom, biographie });
      res.status(200).json(auteur);
    } else {
      res.status(404).json({ message: 'Auteur non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'auteur', error: error.message });
  }
};

// Supprime un auteur et tous ses livres associés
export const deleteAuteur = async (req, res) => {
    const { id } = req.params;
    try {
      const auteur = await Auteur.findByPk(id);
      if (auteur) {
        // Supprimer d'abord tous les livres associés
        await Livre.destroy({ where: { auteurId: id } });
        // Ensuite, supprimer l'auteur
        await auteur.destroy();
        res.status(200).json({ message: 'Auteur et ses livres supprimés avec succès' });
      } else {
        res.status(404).json({ message: 'Auteur non trouvé' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression de l\'auteur', error: error.message });
    }
  }
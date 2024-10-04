import { Livre, Auteur } from '../models/index.js';

export const getAllLivres = async (req, res) => {
  try {
    const livres = await Livre.findAll({ include: Auteur });
    res.json(livres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLivreById = async (req, res) => {
  try {
    const livre = await Livre.findByPk(req.params.id, { include: Auteur });
    if (livre) {
      res.json(livre);
    } else {
      res.status(404).json({ message: 'Livre non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createLivre = async (req, res) => {
  try {
    const livre = await Livre.create(req.body);
    res.status(201).json(livre);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateLivre = async (req, res) => {
  try {
    const livre = await Livre.findByPk(req.params.id);
    if (livre) {
      await livre.update(req.body);
      res.json(livre);
    } else {
      res.status(404).json({ message: 'Livre non trouvé' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteLivre = async (req, res) => {
    try {
      const livre = await Livre.findByPk(req.params.id);
      if (livre) {
        await livre.destroy();
        res.status(200).json({ message: 'Livre supprimé avec succès' });
      } else {
        res.status(404).json({ message: 'Livre non trouvé' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  // Récupérer le token dans l'en-tête Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Ex: "Bearer token"

  if (!token) {
    return res.status(401).json({ error: 'Accès refusé. Aucun token fourni.' });
  }

  // Vérifier le token
  jwt.verify(token, process.env.JWT_SECRET || 'a78oiu8', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }

    // Attacher les informations décodées (ex: utilisateur) à la requête
    req.user = decoded;

    // Passer à la prochaine fonction middleware ou au contrôleur
    next();
  });
};

// Middleware pour vérifier si l'utilisateur est un administrateur
export const adminMiddleware = (req, res, next) => {
    // Vérifie si l'utilisateur existe et a le rôle d'administrateur
    if (req.user && req.user.role === 'admin') {
      // Si c'est le cas, passe au middleware suivant
      next();
    } else {
      // Sinon, renvoie une erreur 403 (Accès refusé)
      res.status(403).json({ error: 'Accès refusé. Droits d\'administrateur requis.' });
    }
  };
  
  // Middleware pour vérifier si l'utilisateur est un administrateur ou le propriétaire du compte
  export const adminOrSelfMiddleware = (req, res, next) => {
    // Vérifie si l'utilisateur existe et est soit un administrateur, soit le propriétaire du compte
    if (req.user && (req.user.role === 'admin' || req.user.id.toString() === req.params.id)) {
      // Si c'est le cas, passe au middleware suivant
      next();
    } else {
      // Sinon, renvoie une erreur 403 (Accès refusé)
      res.status(403).json({ error: 'Accès refusé. Droits d\'administrateur ou propriétaire du compte requis.' });
    }
  }
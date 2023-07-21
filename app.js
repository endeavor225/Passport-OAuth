const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config()
const app = express();

// Configuration de express-session
app.use(
  session({
    secret: process.env.SECRET_KEY, // Remplacez par une chaîne aléatoire pour sécuriser la session
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000, // Durée de vie du cookie de session en millisecondes (1 heure)
    },
    // name: 'mon-cookie-session', // Nom personnalisé pour le cookie de session. Par défaut, il est défini sur "connect.sid". 
  })
);

// Middleware pour initialiser Passport et le persister dans la session
app.use(passport.initialize());
app.use(passport.session());

// Configure l'ID client et la clé secrète pour Google OAuth
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Configuration de la stratégie Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      // Cette fonction est appelée lorsque l'utilisateur est authentifié avec Google.
      // Vous pouvez récupérer les informations de l'utilisateur depuis le profil.
      // Faites ici les traitements nécessaires (par exemple, sauvegarde en base de données, etc.).
      return done(null, profile);
    }
  )
);

/**
 * Exemple de sérialisation de l'utilisateur (l'ID est stocké dans la session)
 */
// Configuration de la sérialisation de l'utilisateur
passport.serializeUser((user,callback)=>{
  callback(null, user); // Remplacez "user.id" par l'identifiant unique de l'utilisateur dans votre base de données
})
// Configuration de la désérialisation de l'utilisateur
passport.deserializeUser((user, callback)=>{
  callback(null, user);
})

// Route d'authentification avec Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Route de rappel après l'authentification avec Google
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Redirection après une authentification réussie.
    res.redirect('/auth'); // Remplacez "/dashboard" par l'URL souhaitée pour la page d'accueil de l'utilisateur connecté.
  }
);

// Route de déconnexion
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      // Gérer l'erreur si nécessaire
      console.error('Erreur lors de la déconnexion :', err);
    }
    res.redirect('/'); // Redirigez vers la page d'accueil après une déconnexion réussie
  } );
});


// Middleware pour vérifier l'authentification
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // L'utilisateur est authentifié, passez à la prochaine fonction de middleware ou à la route suivante
  }
  res.redirect('/'); // Redirigez vers la page de connexion si l'utilisateur n'est pas authentifié
};

// Route pour la page d'accueil
app.get('/', (req, res) => {
  res.send('Bienvenue sur la page d\'accueil.');
});

app.get('/auth', ensureAuthenticated, (req, res) => {
  res.send('Vous être bien connecté');
});

// Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
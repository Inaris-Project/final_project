// server.js - Backend sécurisé pour Inaris
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const helmet = require('helmet');
const hpp = require('hpp');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { articles, testimonials } = require('./data');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'https://inaris.eu';
const ALLOWED_ORIGINS = [FRONTEND_ORIGIN, 'https://www.inaris.eu', 'http://localhost:3000'].filter(Boolean);
const REQUEST_TIMEOUT_MS = 15_000; // Un peu plus long pour SerpAPI

app.set('trust proxy', 1);

// Middlewares de sécurité
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'same-site' }
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // appels serveur à serveur
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error('Origin non autorisée'));
    },
    methods: ['POST', 'GET'],
    credentials: true
  })
);

app.use(hpp());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Trop de requêtes, réessaye plus tard'
});

const searchLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Trop de requêtes sur la recherche, réessaye plus tard'
});

app.use('/api/', apiLimiter);
app.use('/api/search-companies', searchLimiter);

// SerpAPI
const SERPAPI_KEY = process.env.SERPAPI_KEY || '';
const SERPAPI_URL = 'https://serpapi.com/search';

const cleanInput = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length < 2 || trimmed.length > 80) return null;
  return /^[\p{L}\p{M}\p{N}\s'’\-,.()]+$/u.test(trimmed) ? trimmed : null;
};

// Routes de données statiques
app.get('/api/articles', (req, res) => {
  res.json({ articles });
});

app.get('/api/testimonials', (req, res) => {
  res.json({ testimonials });
});

// Route d'authentification simulée
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password && password.length >= 6) {
    const user = {
      id: 'u_' + Date.now(),
      name: email.split('@')[0],
      email: email,
      type: req.body.type || 'student',
      token: 'mock_jwt_' + Math.random().toString(36).substr(2)
    };
    return res.json({ user });
  }
  res.status(401).json({ error: 'Identifiants invalides' });
});

// Route sécurisée pour la recherche
app.post('/api/search-companies', async (req, res) => {
  try {
    const { sector, city } = req.body || {};
    const safeSector = cleanInput(sector);
    const safeCity = cleanInput(city);

    if (!safeSector || !safeCity) {
      return res.status(400).json({ error: 'Secteur et ville requis (2-80 caractères)' });
    }

    if (!SERPAPI_KEY) {
      return res.status(503).json({ 
        error: 'Service indisponible',
        message: 'SERPAPI_KEY manquante'
      });
    }

    console.log(`🔍 Recherche: ${safeSector} à ${safeCity}`);
    const searchQuery = `${safeSector} ${safeCity}`;

    const response = await axios.get(SERPAPI_URL, {
      params: {
        engine: 'google_maps',
        q: searchQuery,
        type: 'search',
        api_key: SERPAPI_KEY,
        hl: 'fr',
        gl: 'fr'
      },
      timeout: REQUEST_TIMEOUT_MS
    });

    if (!response.data?.local_results) {
        return res.json({ companies: [] });
    }

    const companies = response.data.local_results
      .slice(0, 15)
      .map((place, i) => ({
        id: place.place_id || `${Date.now()}-${i}`,
        name: (place.title || 'Entreprise').toString().slice(0, 120),
        sector: safeSector,
        city: safeCity,
        description: (place.type || place.description || `Entreprise ${safeSector}`).toString().slice(0, 280),
        address: (place.address || `${safeCity}, France`).toString().slice(0, 200),
        size: place.service_options?.length > 3 ? 'Entreprise' : 'PME',
        phone: (place.phone || 'Non disponible').toString().slice(0, 40),
        website: (place.website || '').toString().slice(0, 200),
        rating: place.rating || (4.0 + Math.random() * 0.9).toFixed(1),
        reviews: place.reviews || 0,
        hours: (place.hours || 'Non spécifié').toString().slice(0, 100),
        thumbnail: place.thumbnail || null
      }));

    console.log(`✅ ${companies.length} trouvées`);
    res.json({ companies });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    const status = error.response?.status === 429 ? 429 : 500;
    res.status(status).json({ 
      error: 'Erreur de recherche',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    source: 'SerpApi',
    configured: !!SERPAPI_KEY 
  });
});

// CORS Error Handler
app.use((err, req, res, next) => {
  if (err && err.message === 'Origin non autorisée') {
    return res.status(403).json({ error: 'Origin non autorisée' });
  }
  return next(err);
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur sécurisé sur le port ${PORT}`);
  console.log(`🔒 Mode: ${process.env.NODE_ENV || 'development'}`);
});

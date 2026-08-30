// Données statiques déportées du frontend

const articles = [
  { 
    id: 1, 
    title: "Comment rédiger une lettre de motivation parfaite", 
    category: "Lettres", 
    content: "La lettre de motivation est ta première impression auprès d'un recruteur...",
    image: "✉️", 
    date: "2024-11-15", 
    views: 2847, 
    author: "Sophie Martin" 
  },
  { 
    id: 2, 
    title: "10 questions d'entretien et comment y répondre", 
    category: "Entretiens", 
    content: "Prépare-toi aux questions les plus fréquentes en entretien...",
    image: "💼", 
    date: "2024-11-14", 
    views: 3142, 
    author: "Thomas Dubois" 
  },
  // ... (autres articles réduits pour l'exemple, à compléter si besoin complet)
];

const testimonials = [
  { name: "Paul", age: 17, message: "Stage trouvé en 48h", icon: "🎯" },
  { name: "Marie", age: 15, message: "A trouvé un stage en design", icon: "🎨" },
  { name: "Lucas", age: 19, message: "Stage en développement web", icon: "💻" },
  { name: "Sarah", age: 16, message: "Stage trouvé en 2 jours", icon: "⚡" }
];

module.exports = { articles, testimonials };


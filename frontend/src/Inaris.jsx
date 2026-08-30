import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, FileText, Users, LogIn, Menu, X, Clock, CheckCircle, Star, Building, Download, Save, BookOpen, Heart, ArrowRight, Sparkles, Award, Globe, Eye } from 'lucide-react';

const Inaris = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupIndex, setPopupIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const [sectorQuery, setSectorQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [companies, setCompanies] = useState([]);
  const [savedCompanies, setSavedCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchStatus, setSearchStatus] = useState('');

  const [cvData, setCvData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    hobbies: ''
  });
  const [cvColor, setCvColor] = useState('#3B82F6');
  //const [cvTemplate, setCvTemplate] = useState('modern');
  const [savedCVs, setSavedCVs] = useState([]);

  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleCategory, setArticleCategory] = useState('all');
  const [testimonials, setTestimonials] = useState([]);
  
  const [loginData, setLoginData] = useState({ email: '', password: '', name: '', type: 'student' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        let API_URL = 'http://localhost:3001';
        if (process.env.REACT_APP_API_URL !== undefined) {
          API_URL = process.env.REACT_APP_API_URL;
        }
        
        // Fetch articles
        const resArticles = await fetch(`${API_URL}/api/articles`);
        if (resArticles.ok) {
          const data = await resArticles.json();
          setArticles(data.articles || []);
        }

        // Fetch testimonials
        const resTestimonials = await fetch(`${API_URL}/api/testimonials`);
        if (resTestimonials.ok) {
          const data = await resTestimonials.json();
          setTestimonials(data.testimonials || []);
        }
      } catch (err) {
        console.error("Erreur chargement données", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;

    const interval = setInterval(() => {
      setShowPopup(true);
      setPopupIndex((prev) => (prev + 1) % testimonials.length);
      setTimeout(() => setShowPopup(false), 4000);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [testimonials]);

  const handleLogin = async () => {
    if (loginData.email && loginData.password) {
      try {
        let API_URL = 'http://localhost:3001';
        if (process.env.REACT_APP_API_URL !== undefined) {
          API_URL = process.env.REACT_APP_API_URL;
        }
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData)
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setShowLogin(false);
          setCurrentPage('dashboard');
        } else {
          alert('Identifiants incorrects');
        }
      } catch (e) {
        alert('Erreur connexion');
      }
    }
  };

const Toast = ({ message, onClose }) => {
  return (
    <div
      className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg animate-slide-up"
      style={{ zIndex: 9999 }}
    >
      <div className="flex items-center justify-between gap-3">
        <span>{message}</span>
        <button onClick={onClose} className="text-white font-bold">×</button>
      </div>
    </div>
  );
};

// 🔐 FONCTION SÉCURISÉE - Appel au backend
const searchCompaniesWeb = async (sector, city) => {
  try {
    let API_URL = 'http://localhost:3001';
    if (process.env.REACT_APP_API_URL !== undefined) {
      API_URL = process.env.REACT_APP_API_URL;
    }
    
    const response = await fetch(`${API_URL}/api/search-companies`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sector, city })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur de recherche');
    }

    const data = await response.json();
    return data.companies || [];
    
  } catch (error) {
    console.error('Erreur recherche:', error);
    throw error;
  }
};

  const handleSearch = async () => {
    if (!sectorQuery || !cityQuery) {
      alert('Remplis les 2 champs !');
      return;
    }

    setIsSearching(true);
    setCompanies([]);
    setSearchProgress(0);

    try {
      setSearchStatus('🔍 Initialisation...');
      setSearchProgress(10);
      await new Promise(r => setTimeout(r, 500));

      setSearchStatus(`🌍 Analyse de ${cityQuery}...`);
      setSearchProgress(40);
      await new Promise(r => setTimeout(r, 500));

      setSearchStatus('🎯 Recherche de toutes les entreprises...');
      setSearchProgress(60);

      const results = await searchCompaniesWeb(sectorQuery, cityQuery);

      setSearchProgress(100);
      setSearchStatus('✅ Terminé !');

      if (results.length === 0) {
        alert('Aucune entreprise trouvée');
      } else {
        setCompanies(results);
      }
    } catch (error) {
      alert('Erreur de recherche');
    } finally {
      setTimeout(() => {
        setIsSearching(false);
        setSearchProgress(0);
      }, 1000);
    }
  };

  const toggleSaveCompany = (id) => {
    setSavedCompanies(savedCompanies.includes(id) ? savedCompanies.filter(i => i !== id) : [...savedCompanies, id]);
  };

  const updateCVField = (f, v) => {
    setCvData({...cvData, [f]: v});
  };

  const saveCV = () => {
    setSavedCVs([...savedCVs, {...cvData, id: Date.now(), date: new Date().toLocaleDateString(), color: cvColor}]);
    alert('✅ CV sauvegardé !');
  };

  const exportToPDF = () => {
    alert('🎉 CV exporté !');
  };

  const renderHome = () => (
    <div className="min-h-screen overflow-hidden">
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/30 rounded-full filter blur-3xl animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 mb-8">
              <Sparkles className="text-yellow-300" size={20} />
              <span className="text-white font-semibold">Plateforme #1 des stages</span>
            </div>

            <h1 className="text-6xl sm:text-8xl font-black mb-6 text-white">
              Trouve ton stage
              <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mt-2">
                en quelques clics
              </span>
            </h1>

            <p className="text-xl sm:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto">
              La plateforme qui connecte les étudiants aux meilleures opportunités
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-16">
              <button onClick={() => setCurrentPage('search')} className="bg-white text-gray-900 px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-3">
                <Search size={24} />
                Découvrir les offres
                <ArrowRight size={20} />
              </button>
              <button onClick={() => setCurrentPage('cv')} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-3">
                <Sparkles size={24} />
                Créer mon CV
              </button>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              {[
                { icon: <Users size={20} />, text: "10,000+ étudiants" },
                { icon: <Building size={20} />, text: "2,500+ entreprises" },
                { icon: <Award size={20} />, text: "95% satisfaits" }
              ].map((s, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 flex items-center gap-2 text-white">
                  {s.icon}
                  <span className="font-semibold">{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
              🚀 LA SOLUTION COMPLÈTE
            </div>
            <h2 className="text-6xl font-black mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Tout ce dont tu as besoin
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une plateforme pensée pour maximiser tes chances de décrocher le stage parfait
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Search size={56} />,
                title: "Recherche Ultra-Puissante",
                desc: "Notre IA trouve TOUTES les entreprises de ta ville : des petites startups locales aux grands groupes. Zéro entreprise manquée !",
                color: "from-blue-500 to-blue-600",
                stats: "2500+ entreprises",
                action: () => setCurrentPage('search')
              },
              {
                icon: <FileText size={56} />,
                title: "CV Pro en 5 Minutes",
                desc: "Crée un CV qui impressionne les recruteurs. Design moderne, personnalisable, et prêt à envoyer en un clic.",
                color: "from-purple-500 to-purple-600",
                stats: "10000+ CV créés",
                action: () => setCurrentPage('cv')
              },
              {
                icon: <BookOpen size={56} />,
                title: "Guide du Candidat Parfait",
                desc: "Accède à nos ressources exclusives : lettres de motivation, conseils d'entretien, et astuces des pros.",
                color: "from-pink-500 to-pink-600",
                stats: "50+ articles",
                action: () => setCurrentPage('articles')
              }
            ].map((f, i) => (
              <div key={i} onClick={f.action} className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 cursor-pointer">
                <div className={`w-20 h-20 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {f.icon}
                </div>
                <div className="text-sm font-bold text-gray-500 mb-2">{f.stats}</div>
                <h3 className="text-2xl font-black mb-4 text-gray-900">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-32 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6 text-white">
              Ils ont trouvé leur stage avec Inaris
            </h2>
            <p className="text-xl text-blue-200">
              Rejoins des milliers d'étudiants qui ont réussi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: <Users size={40} />, num: "10,000+", label: "Étudiants satisfaits", color: "blue" },
              { icon: <Building size={40} />, num: "2,500+", label: "Entreprises partenaires", color: "purple" },
              { icon: <Clock size={40} />, num: "48h", label: "Délai moyen", color: "pink" },
              { icon: <Star size={40} />, num: "95%", label: "Taux de réussite", color: "yellow" }
            ].map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 text-center">
                <div className="flex justify-center mb-4 text-white">{s.icon}</div>
                <div className="text-5xl font-black mb-3 text-white">{s.num}</div>
                <div className="text-lg text-blue-200 font-semibold">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20">
            <div className="grid md:grid-cols-3 gap-8 text-white">
              {[
                { emoji: "⚡", name: "Sarah, 17 ans", text: "J'ai trouvé mon stage en design en seulement 2 jours ! L'interface est super intuitive." },
                { emoji: "💼", name: "Lucas, 19 ans", text: "Le créateur de CV m'a vraiment aidé. J'ai reçu 3 réponses positives en une semaine !" },
                { emoji: "🎯", name: "Emma, 16 ans", text: "Les conseils m'ont beaucoup aidée pour mon entretien. Je commence lundi !" }
              ].map((t, i) => (
                <div key={i} className="text-center">
                  <div className="text-5xl mb-4">{t.emoji}</div>
                  <p className="text-lg mb-3 italic">"{t.text}"</p>
                  <p className="font-bold text-blue-200">{t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full px-6 py-3 mb-8">
            <Sparkles className="text-yellow-300" size={20} />
            <span className="text-white font-semibold">Offre de lancement</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-black mb-6 text-white">
            Prêt à trouver ton stage ?
          </h2>
          <p className="text-2xl mb-12 text-white/90 max-w-2xl mx-auto">
            Inscris-toi gratuitement et accède à toutes les fonctionnalités en illimité
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <button onClick={() => setCurrentPage('search')} className="bg-white text-blue-600 px-12 py-6 rounded-2xl font-black text-xl hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-3">
              Commencer gratuitement
              <ArrowRight size={24} />
            </button>
          </div>

          <div className="flex flex-wrap gap-6 justify-center text-white">
            {[
              { icon: <CheckCircle size={20} />, text: "100% Gratuit" },
              { icon: <CheckCircle size={20} />, text: "Sans engagement" },
              { icon: <CheckCircle size={20} />, text: "Accès illimité" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20">
                {item.icon}
                <span className="font-semibold">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-black text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Trouve ton entreprise
        </h1>
        <p className="text-center text-gray-600 mb-12 text-lg">Petites, moyennes et grandes entreprises</p>

        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-gray-700">Secteur d'activité</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Ex: Informatique, Design, Marketing..."
                value={sectorQuery}
                onChange={(e) => setSectorQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none font-semibold"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2 text-gray-700">Ta ville</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Ex: Paris, Lyon, ton village..."
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none font-semibold"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Search size={24} />
            {isSearching ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>

        {isSearching && (
          <div className="bg-white rounded-3xl shadow-2xl p-12 mb-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse mx-auto mb-6">
                <Search size={48} className="text-white" />
              </div>
              <h3 className="text-3xl font-black mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Recherche de ton stage
              </h3>
              <p className="text-lg text-gray-600 mb-6">{searchStatus}</p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all" style={{ width: `${searchProgress}%` }}></div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{searchProgress}%</div>
            </div>
          </div>
        )}

        {!isSearching && companies.length > 0 && (
          <>
            <div className="mb-6 text-center">
              <span className="bg-green-100 text-green-800 px-6 py-3 rounded-full font-bold text-lg">
                🎉 {companies.length} entreprises trouvées
              </span>
            </div>

            <div className="grid gap-6">
              {companies.map((c) => (
                <div key={c.id} className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all">
                  <div className="flex justify-between mb-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                        {c.name[0]}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">{c.name}</h3>
                        <p className="text-gray-600">{c.sector}</p>
                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold mt-1">
                          {c.size}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => toggleSaveCompany(c.id)} className={`p-2 rounded-xl h-fit ${savedCompanies.includes(c.id) ? 'bg-pink-100' : 'bg-gray-100'}`}>
                      <Heart size={20} className={savedCompanies.includes(c.id) ? 'text-pink-500 fill-pink-500' : 'text-gray-400'} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-bold">{c.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      {c.address}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{c.description}</p>

                  <div className="space-y-2 mb-4">
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="text-blue-600 hover:underline text-sm flex items-center gap-2">
                        📞 {c.phone}
                      </a>
                    )}
                    {c.website && (
                      <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-2">
                        <Globe size={16} />
                        Site web
                      </a>
                    )}
                  </div>

                  <button onClick={() => setSelectedCompany(c)} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold">
                    Voir détails
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedCompany && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedCompany(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold">{selectedCompany.name}</h2>
                <p className="text-gray-600">{selectedCompany.sector}</p>
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold mt-2">
                  {selectedCompany.size}
                </span>
              </div>
              <button onClick={() => setSelectedCompany(null)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex gap-3">
                <MapPin className="text-blue-600" size={20} />
                <div>
                  <p className="font-bold">Adresse</p>
                  <p className="text-gray-600">{selectedCompany.address}</p>
                </div>
              </div>
              {selectedCompany.phone && (
                <div className="flex gap-3">
                  <div className="text-blue-600 text-xl">📞</div>
                  <div>
                    <p className="font-bold">Téléphone</p>
                    <a href={`tel:${selectedCompany.phone}`} className="text-blue-600 hover:underline">
                      {selectedCompany.phone}
                    </a>
                  </div>
                </div>
              )}
              {selectedCompany.website && (
                <div className="flex gap-3">
                  <Globe className="text-blue-600" size={20} />
                  <div>
                    <p className="font-bold">Site web</p>
                    <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {selectedCompany.website}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-lg mb-2">À propos</h3>
              <p className="text-gray-700">{selectedCompany.description}</p>
            </div>

            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold">
              Postuler
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderCV = () => (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-black text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Créateur de CV Pro ✨
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-6">Informations</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Nom complet" value={cvData.name} onChange={(e) => updateCVField('name', e.target.value)} className="w-full px-4 py-3 border-2 rounded-xl focus:border-purple-500 focus:outline-none" />
                <input type="email" placeholder="Email" value={cvData.email} onChange={(e) => updateCVField('email', e.target.value)} className="w-full px-4 py-3 border-2 rounded-xl focus:border-purple-500 focus:outline-none" />
                <input type="tel" placeholder="Téléphone" value={cvData.phone} onChange={(e) => updateCVField('phone', e.target.value)} className="w-full px-4 py-3 border-2 rounded-xl focus:border-purple-500 focus:outline-none" />
                <textarea placeholder="Résumé professionnel" value={cvData.summary} onChange={(e) => updateCVField('summary', e.target.value)} rows={4} className="w-full px-4 py-3 border-2 rounded-xl focus:border-purple-500 focus:outline-none" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-4">Couleur du CV</h2>
              <div className="flex gap-3">
                {['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'].map(color => (
                  <button key={color} onClick={() => setCvColor(color)} className={`w-12 h-12 rounded-xl ${cvColor === color ? 'ring-4 ring-offset-2' : ''}`} style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={saveCV} className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                <Save size={20} />
                Sauvegarder
              </button>
              <button onClick={exportToPDF} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                <Download size={20} />
                Export PDF
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl" style={{ borderTop: `6px solid ${cvColor}` }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: cvColor }}>Aperçu en temps réel</h2>
            <h1 className="text-3xl font-bold mb-2" style={{ color: cvColor }}>
              {cvData.name || 'Votre Nom'}
            </h1>
            <p className="text-gray-600 mb-4">{cvData.email || 'email@example.com'}</p>
            {cvData.phone && <p className="text-gray-600 mb-4">{cvData.phone}</p>}
            {cvData.summary && (
              <div className="mt-6">
                <h2 className="text-lg font-bold mb-2" style={{ color: cvColor }}>Profil</h2>
                <p className="text-gray-700">{cvData.summary}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderArticles = () => {
    const categories = ['all', 'Lettres', 'Entretiens', 'CV', 'Réseau', 'Conseils', 'Compétences'];
    const filteredArticles = articleCategory === 'all' ? articles : articles.filter(a => a.category === articleCategory);

    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-orange-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block bg-gradient-to-r from-pink-600 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-4">
              📚 CENTRE DE RESSOURCES
            </div>
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
              Guides & Conseils d'Experts
            </h1>
            <p className="text-xl text-gray-600">
              Tout ce dont tu as besoin pour réussir ta recherche de stage
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setArticleCategory(cat)}
                className={`px-6 py-3 rounded-full font-bold transition-all ${
                  articleCategory === cat
                    ? 'bg-gradient-to-r from-pink-600 to-orange-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:shadow-md'
                }`}
              >
                {cat === 'all' ? 'Tous les guides' : cat}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((a) => (
              <div key={a.id} className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer" onClick={() => setSelectedArticle(a)}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-5xl">{a.image}</div>
                  <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-bold">
                    {a.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{a.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Eye size={16} />
                    {a.views}
                  </span>
                  <span>Par {a.author}</span>
                </div>
                <button className="w-full bg-gradient-to-r from-pink-600 to-orange-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                  Lire le guide
                  <ArrowRight size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {selectedArticle && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setSelectedArticle(null)}>
            <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-6xl">{selectedArticle.image}</div>
                    <span className="bg-pink-100 text-pink-600 px-4 py-2 rounded-full text-sm font-bold">
                      {selectedArticle.category}
                    </span>
                  </div>
                  <h2 className="text-4xl font-black mb-3 text-gray-900">{selectedArticle.title}</h2>
                  <div className="flex items-center gap-6 text-gray-600">
                    <span className="font-semibold">Par {selectedArticle.author}</span>
                    <span>{selectedArticle.date}</span>
                    <span className="flex items-center gap-1">
                      <Eye size={18} />
                      {selectedArticle.views} vues
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedArticle(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={32} />
                </button>
              </div>

              <div className="prose prose-lg max-w-none">
                <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl p-6 mb-8 border-l-4 border-pink-600">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedArticle.content}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-gradient-to-r from-pink-600 to-orange-600 rounded-2xl p-6 text-white text-center">
                  <h3 className="text-2xl font-bold mb-3">Prêt à mettre ces conseils en pratique ?</h3>
                  <button onClick={() => { setSelectedArticle(null); setCurrentPage('search'); }} className="bg-white text-pink-600 px-8 py-3 rounded-xl font-bold hover:shadow-xl transition-all">
                    Chercher mon stage maintenant
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Bienvenue {user?.name} 🎉
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Candidatures", value: "5", icon: <Briefcase size={32} />, color: "blue" },
            { title: "Entreprises sauvegardées", value: savedCompanies.length, icon: <Building size={32} />, color: "purple" },
            { title: "CV créés", value: savedCVs.length, icon: <FileText size={32} />, color: "pink" }
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-xl">
              <div className="text-blue-600 mb-3">{s.icon}</div>
              <div className="text-4xl font-bold mb-2">{s.value}</div>
              <div className="text-gray-600">{s.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white/80 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center cursor-pointer" onClick={() => setCurrentPage('home')}>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mr-3 shadow-lg">
                I
              </div>
              <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Inaris
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => setCurrentPage('search')} className="text-gray-700 hover:text-blue-600 font-bold transition-colors">Rechercher</button>
              <button onClick={() => setCurrentPage('cv')} className="text-gray-700 hover:text-purple-600 font-bold transition-colors">Créer CV</button>
              <button onClick={() => setCurrentPage('articles')} className="text-gray-700 hover:text-pink-600 font-bold transition-colors">Ressources</button>


            </div>

            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <button onClick={() => { setCurrentPage('search'); setIsMenuOpen(false); }} className="block w-full text-left py-2 text-gray-700 hover:text-blue-600 font-bold">Rechercher</button>
              <button onClick={() => { setCurrentPage('cv'); setIsMenuOpen(false); }} className="block w-full text-left py-2 text-gray-700 hover:text-purple-600 font-bold">Créer CV</button>
              <button onClick={() => { setCurrentPage('articles'); setIsMenuOpen(false); }} className="block w-full text-left py-2 text-gray-700 hover:text-pink-600 font-bold">Ressources</button>
              {!user && (
                <button onClick={() => { setShowLogin(true); setIsMenuOpen(false); }} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-full font-bold">
                  Connexion
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {currentPage === 'home' && renderHome()}
      {currentPage === 'search' && renderSearch()}
      {currentPage === 'cv' && renderCV()}
      {currentPage === 'articles' && renderArticles()}
      {currentPage === 'dashboard' && renderDashboard()}

      {showPopup && (
        <div className="fixed bottom-8 right-8 bg-white rounded-2xl shadow-2xl p-6 max-w-sm z-50 border-l-4 border-green-500">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{testimonials[popupIndex].icon}</div>
            <div>
              <p className="font-bold">{testimonials[popupIndex].message}</p>
              <p className="text-sm text-gray-600">{testimonials[popupIndex].name}, {testimonials[popupIndex].age} ans</p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>
      )}

      {showLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <div className="flex justify-between mb-6">
              <h2 className="text-3xl font-black">{isSignup ? 'Inscription' : 'Connexion'}</h2>
              <button onClick={() => setShowLogin(false)}><X size={24} /></button>
            </div>

            <div className="space-y-4">
              {isSignup && <input type="text" placeholder="Nom" value={loginData.name} onChange={(e) => setLoginData({...loginData, name: e.target.value})} className="w-full px-4 py-3 border-2 rounded-xl focus:border-blue-500 focus:outline-none" />}
              <input type="email" placeholder="Email" value={loginData.email} onChange={(e) => setLoginData({...loginData, email: e.target.value})} className="w-full px-4 py-3 border-2 rounded-xl focus:border-blue-500 focus:outline-none" />
              <input type="password" placeholder="Mot de passe" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} className="w-full px-4 py-3 border-2 rounded-xl focus:border-blue-500 focus:outline-none" />

              {isSignup && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={loginData.type === 'student'} onChange={() => setLoginData({...loginData, type: 'student'})} />
                    <span>Je suis étudiant</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={loginData.type === 'company'} onChange={() => setLoginData({...loginData, type: 'company'})} />
                    <span>Je suis une entreprise</span>
                  </label>
                </div>
              )}

              <button onClick={handleLogin} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-xl">
                {isSignup ? "S'inscrire" : 'Se connecter'}
              </button>
            </div>

            <p className="text-center mt-6">
              {isSignup ? 'Déjà un compte ?' : 'Pas de compte ?'}
              <button onClick={() => setIsSignup(!isSignup)} className="text-blue-600 font-bold ml-2">
                {isSignup ? 'Se connecter' : "S'inscrire"}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inaris;

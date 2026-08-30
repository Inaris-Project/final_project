# 🚀 Inaris — Plateforme de Recherche de Stages

> Application web permettant aux étudiants de rechercher des entreprises pour leurs stages via une recherche géolocalisée en temps réel.

🌐 **Production** → [https://inaris.eu](https://inaris.eu)

---

## 🖥️ Infrastructure

| Élément     | Valeur                            |
|-------------|-----------------------------------|
| Hébergeur   | OVH VPS                           |
| IP          | 141.95.86.121                     |
| OS          | Debian GNU/Linux 13 (trixie)      |
| Domaine     | inaris.eu (DNS IONOS)             |
| SSL         | Let's Encrypt — renouvellement auto|

---

## 🏗️ Architecture
```
Internet (HTTPS :443)
        │
   [ Nginx — Reverse Proxy ]
        ├── /       → :8080 → inaris-frontend (React)
        └── /api/   → :3001 → inaris-backend  (Express + SerpAPI)

Réseau Docker interne : 172.20.0.0/24
```

---

## 🗂️ Arborescence
```
inaris/
├── backend/           # API Express.js (port 3001)
├── frontend/          # App React + Tailwind (port 8080)
├── patches/
│   └── example_system/
│       ├── deploy.sh
│       └── configs/
│           ├── nginx_host.conf        # Reverse proxy + SSL
│           ├── fail2ban_jail.local    # Protection brute-force
│           └── ssh_hardening.conf     # Durcissement SSH
├── docker-compose.yml
├── RUNBOOK.md         # Documentation opérationnelle complète
└── .env               # SERPAPI_KEY (non versionné)
```

---

## 🔐 Sécurité mise en place

- **UFW** — Firewall, seuls les ports 80, 443 et 2222 sont ouverts
- **Fail2ban** — Ban automatique après 3 tentatives SSH (24h)
- **Nginx** — Rate limiting, headers HTTP sécurisés, blocage bots
- **Docker** — Conteneurs read-only, no-new-privileges, ressources limitées
- **SSH** — Port 2222, root désactivé, authentification par clé uniquement
- **SSL** — TLS 1.2/1.3, HSTS preload

---

## ⚙️ Commandes essentielles
```bash
# État des conteneurs
sudo docker ps

# Logs backend / frontend
sudo docker logs -f inaris-backend
sudo docker logs -f inaris-frontend

# Rebuild après modification
cd ~/inaris && sudo docker compose down && sudo docker compose up -d --build

# Recharger Nginx
sudo nginx -t && sudo systemctl reload nginx

# IPs bannies
sudo fail2ban-client status sshd

# Health check
curl https://inaris.eu/api/health
```

---

> 📖 Documentation opérationnelle complète → [RUNBOOK.md](./RUNBOOK.md)

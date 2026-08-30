# RUNBOOK — Inaris Project
> Documentation opérationnelle — Usage interne

---

## 🖥️ Infrastructure

| Élément         | Valeur                                      |
|-----------------|---------------------------------------------|
| Serveur         | VPS OVH                                     |
| Hostname        | vps-085534d2                                |
| IP publique     | 141.95.86.121                               |
| OS              | Debian GNU/Linux 13 (trixie) — kernel 6.12  |
| Utilisateur     | debian                                      |
| Projet          | /home/debian/inaris                         |
| Domaine         | https://inaris.eu                           |
| DNS             | IONOS (TTL 60s)                             |
| SSL             | Let's Encrypt — expire 2026-06-30           |

---

## 🗂️ Arborescence
```
/home/debian/inaris/
├── .env                          # Variables d'environnement (SERPAPI_KEY) — NE PAS COMMITER
├── docker-compose.yml            # Orchestration des conteneurs
├── backend/
│   ├── Dockerfile
│   ├── server.js                 # API Express.js (port 3001 interne)
│   ├── data.js                   # Données statiques (articles, témoignages)
│   └── package.json
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf                # Nginx interne au conteneur
│   ├── src/
│   │   └── Inaris.jsx            # Composant principal React
│   └── package.json
└── patches/
    └── example_system/
        ├── deploy.sh             # Script de déploiement initial
        └── configs/
            ├── nginx_host.conf   # Config Nginx hôte (reverse proxy)
            ├── fail2ban_jail.local
            └── ssh_hardening.conf

/etc/nginx/sites-available/inaris # Config Nginx active (reverse proxy)
/etc/fail2ban/jail.local          # Config Fail2ban
/etc/ssh/sshd_config.d/hardening.conf  # Durcissement SSH
/etc/letsencrypt/live/inaris.eu/  # Certificats SSL
/var/log/nginx/inaris.access.log  # Logs accès
/var/log/nginx/inaris.error.log   # Logs erreurs
```

---

## 🐳 Architecture des conteneurs
```
Internet (HTTPS:443)
        │
   Nginx hôte (reverse proxy)
        ├── /        → 127.0.0.1:8080 (inaris-frontend)
        └── /api/    → 127.0.0.1:3001 (inaris-backend)
                              │
                         SerpAPI (Google Maps)
                         https://serpapi.com

Réseau Docker interne : inaris_inaris-network (172.20.0.0/24)
```

| Conteneur        | Image            | Port interne | Ressources max     |
|------------------|------------------|--------------|--------------------|
| inaris-frontend  | inaris-frontend  | 8080→80      | 0.5 CPU / 128 MB   |
| inaris-backend   | inaris-backend   | 3001→3001    | 0.5 CPU / 256 MB   |

---

## ⚙️ Commandes du quotidien

### Docker
```bash
# État des conteneurs
sudo docker ps

# Logs en temps réel
sudo docker logs -f inaris-backend
sudo docker logs -f inaris-frontend

# Redémarrer un conteneur
sudo docker restart inaris-backend
sudo docker restart inaris-frontend

# Rebuild complet après modification du code
cd ~/inaris
sudo docker compose down
sudo docker compose up -d --build

# Consommation ressources
sudo docker stats --no-stream

# Inspecter le réseau Docker
sudo docker network inspect inaris_inaris-network
```

### Nginx
```bash
# Tester la config avant reload
sudo nginx -t

# Recharger sans coupure
sudo systemctl reload nginx

# Redémarrer
sudo systemctl restart nginx

# Logs en temps réel
sudo tail -f /var/log/nginx/inaris.access.log
sudo tail -f /var/log/nginx/inaris.error.log

# Vérifier les connexions actives
sudo ss -tlnp | grep -E ':80|:443|:8080|:3001'
```

### SSL / Certbot
```bash
# Vérifier l'expiration du certificat
sudo certbot certificates

# Tester le renouvellement (dry-run)
sudo certbot renew --dry-run

# Forcer le renouvellement
sudo certbot renew --force-renewal
```

### Fail2ban
```bash
# État général
sudo fail2ban-client status

# IPs bannies sur SSH
sudo fail2ban-client status sshd

# Débannir une IP
sudo fail2ban-client set sshd unbanip <IP>

# Logs Fail2ban
sudo tail -f /var/log/fail2ban.log
```

### Firewall UFW
```bash
# État complet
sudo ufw status verbose

# Voir les connexions actives
sudo ss -tlnp

# Bloquer une IP manuellement
sudo ufw deny from <IP> to any
```

### Health checks
```bash
# API backend
curl https://inaris.eu/api/health

# Test SSL
curl -vI https://inaris.eu 2>&1 | grep -E "SSL|HTTP|expire"

# DNS
curl -s "https://dns.google/resolve?name=inaris.eu&type=A" | python3 -m json.tool | grep data
```

---

## 🔐 Sécurité en place

| Mesure                    | Détail                                          |
|---------------------------|-------------------------------------------------|
| Firewall UFW              | deny all entrant sauf 80, 443, 2222 (SSH)       |
| Fail2ban SSH              | maxretry=3, bantime=24h                         |
| Fail2ban Nginx            | http-auth, limit-req, botsearch                 |
| SSH                       | Port 2222, root login désactivé, clé uniquement |
| Nginx rate limiting       | 20r/min frontend, 10r/min API                   |
| Headers HTTP              | HSTS, CSP, X-Frame-Options, nosniff...          |
| Docker isolation          | read_only, no-new-privileges, tmpfs, subnet dédié|
| SSL                       | TLS 1.2/1.3 uniquement, renouvellement auto     |
| Mises à jour auto         | unattended-upgrades actif                       |

---

## 🚨 Procédures d'urgence

### Le site ne répond plus
```bash
sudo systemctl status nginx
sudo docker ps
sudo docker compose up -d   # si les conteneurs sont arrêtés
sudo systemctl restart nginx
```

### Rebuild complet depuis zéro
```bash
cd ~/inaris
sudo docker compose down
sudo docker system prune -f
sudo docker compose up -d --build
sudo systemctl reload nginx
```

### Changer la SERPAPI_KEY
```bash
nano ~/inaris/.env          # modifier SERPAPI_KEY=...
sudo docker compose up -d --build inaris-backend
```

### IP du serveur a changé
```bash
# 1. Mettre à jour le DNS dans IONOS (enregistrement A → nouvelle IP)
# 2. Attendre propagation (TTL 60s)
# 3. Renouveler le certificat SSL
sudo certbot renew --force-renewal
```

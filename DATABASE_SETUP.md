# Configuration de la base de données PostgreSQL

## Prérequis

1. **PostgreSQL installé** sur votre machine
2. **Node.js** et **npm** installés
3. **Dépendance pg** installée : `npm install pg`

## Configuration

### 1. Créer la base de données

```sql
CREATE DATABASE prierenligne;
```

### 2. Configurer les variables d'environnement

Copiez le fichier `env.example` vers `.env` et modifiez les valeurs :

```bash
cp env.example .env
```

Modifiez le fichier `.env` avec vos paramètres :

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=prierenligne
DB_PASSWORD=votre_mot_de_passe
DB_PORT=5432
```

### 3. Initialiser la base de données

Exécutez le script SQL d'initialisation :

```bash
psql -U postgres -d prierenligne -f init-database.sql
```

Ou connectez-vous à PostgreSQL et exécutez le script :

```bash
psql -U postgres
\c prierenligne
\i init-database.sql
```

## Structure de la base de données

### Table `prayer_intentions`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | SERIAL | Identifiant unique (auto-incrémenté) |
| `name` | VARCHAR(100) | Nom ou pseudo de la personne |
| `intention` | TEXT | Description de l'intention de prière |
| `prayer_count` | INTEGER | Nombre de personnes qui prient pour cette intention |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Date de dernière modification |

## APIs disponibles

### GET `/api/prayer-intentions`
Récupère toutes les intentions de prière (limité à 20, triées par date de création décroissante)

### POST `/api/prayer-intentions`
Crée une nouvelle intention de prière

**Body :**
```json
{
  "name": "Nom ou pseudo",
  "intention": "Description de l'intention"
}
```

### POST `/api/prayer-intentions/:id/pray`
Incrémente le compteur de prière pour une intention spécifique

## Test de la configuration

1. Démarrez le serveur : `npm run dev`
2. Ouvrez l'application dans votre navigateur
3. Cliquez sur "+ Ajouter" dans la section "Intentions de prière récentes"
4. Créez une intention de prière
5. Vérifiez qu'elle apparaît dans la liste
6. Cliquez sur "Je prie" pour incrémenter le compteur

## Dépannage

### Erreur de connexion à la base de données
- Vérifiez que PostgreSQL est démarré
- Vérifiez les paramètres de connexion dans `.env`
- Vérifiez que la base de données `prierenligne` existe

### Erreur "relation does not exist"
- Exécutez le script `init-database.sql`
- Vérifiez que la table `prayer_intentions` a été créée

### Erreur de permissions
- Vérifiez que l'utilisateur PostgreSQL a les droits sur la base de données
- Vérifiez le mot de passe dans `.env` 
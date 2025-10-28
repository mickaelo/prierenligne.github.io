-- Script d'initialisation de la base de données pour Prier en ligne
-- À exécuter dans PostgreSQL

-- Créer la base de données si elle n'existe pas
-- CREATE DATABASE prierenligne;

-- Se connecter à la base de données
-- \c prierenligne;

-- Créer la table des intentions de prière
CREATE TABLE IF NOT EXISTS prayer_intentions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    intention TEXT NOT NULL,
    prayer_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer un index sur la date de création pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_prayer_intentions_created_at ON prayer_intentions(created_at DESC);

-- Insérer quelques intentions de prière d'exemple
INSERT INTO prayer_intentions (name, intention, prayer_count) VALUES
('Marie', 'Pour la paix dans le monde et la guérison des malades', 3),
('Pierre', 'Pour ma famille qui traverse une période difficile', 1),
('Anne', 'Pour tous ceux qui souffrent de solitude', 2),
('Jean', 'Pour les vocations sacerdotales et religieuses', 4),
('Lucie', 'Pour la conversion des cœurs endurcis', 1)
ON CONFLICT DO NOTHING;

-- Afficher les données insérées
SELECT * FROM prayer_intentions ORDER BY created_at DESC; 
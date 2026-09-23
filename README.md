# THW — Fiches & Ligues

Système autonome pour Foundry VTT **Version 14**, destiné aux jeux Two Hour Wargames.

## Ce que le système fournit

- Un type d'Acteur : **Personnage**, avec un rôle Leader / Grunt / Créature.
- Champs : `# Id number`, **REP**, **PEP**, **SAV**, **Race/Profession**, **Class**, **Weapon**, **AC** (2 → 8),
  citation et notes en texte riche.
- Stats affichées selon le rôle : le Leader a REP, PEP et SAV ; le Grunt et la Créature n'ont que REP.
  Les valeurs masquées restent stockées, elles réapparaissent si le rôle change.
- Un type d'Objet : **Attribute**. Les Attributes sont des Objets glissables, rangeables en compendium
  et postables dans le chat.
- **Listes déroulantes** configurables pour Race/Profession, Class et Weapon.
- **Rosters de ligue** : une ligue est un dossier d'Acteurs ; la fenêtre calcule les emplacements
  consommés selon un coût par rôle.
- Test : clic sur une stat → lance N d6 (défaut 2) et compare **chaque dé séparément** à la valeur,
  sans jamais les additionner. Tous les dés ≤ valeur → *Succès* ; une partie → *Succès partiel* ;
  aucun → *Échec*.

## Ce que le système ne fournit pas

**Aucun texte de règles.** Pas d'Attributes pré-remplis, pas de tables, pas de valeurs de référence.
Tu crées tes propres Attributes et remplis tes listes depuis ton exemplaire du jeu.

## Installation

Copier le dossier `thw/` dans `Data/systems/` du  répertoire utilisateur Foundry, puis redémarrer.
Le système apparaît à la création d'un monde.

## Premiers pas

1. **Réglages du jeu → Réglages du système → Gérer les listes** : remplir Race/Profession, Class, Weapon.
2. Régler *Emplacements par ligue* et *Dés par test* dans la même fenêtre.
3. Créer un dossier d'Acteurs par ligue, y placer les personnages.
4. Onglet Acteurs → bouton **Rosters** pour la vue ligue.


## Compatibilité

Écrit pour l'API V14 : `documentTypes` dans `system.json` (plus de `template.json`),
`TypeDataModel`, `ApplicationV2` / `HandlebarsApplicationMixin`, aucune dépendance au helper
`{{#select}}` ni à `colorPicker`, tous deux supprimés en V14.

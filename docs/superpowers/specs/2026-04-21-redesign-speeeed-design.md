# BafangAndroid — Redesign inspiré Speeeed

**Date:** 2026-04-21
**Statut:** Approuvé par l'utilisateur

## Résumé

Redesign complet de l'interface BafangAndroid en s'inspirant du design de l'app Speeeed (github.com/mkopa/speeed). L'app est utilisée uniquement pour programmer le contrôleur — pas d'écran Display/tableau de bord.

## Décisions de design

| Élément | Choix |
|---------|-------|
| Navigation principale | 3 onglets en bas : HOME · SETTINGS · HELP |
| Écran Display | Supprimé — pas dans le scope |
| Onglets Settings | 5 onglets internes : GENERAL · LEVELS · PEDAL · THROTTLE · TORQUE |
| Icônes | Style SVG line icons, inspiré Speeeed |
| Couleur d'accent | Bleu `#3a7bd5` |
| Fond | Noir pur `#000` |
| Surface | `#0d0d0d` |
| Bordures | `#1e1e1e` |

## Screens

### 1. Home (onglet HOME)

- Hamburger menu `☰` en haut à gauche
- **Section Connection**
  - Indicateur USB + icône
  - Bouton `CONNECT` pleine largeur, fond bleu `#3a7bd5`, texte blanc, lettres capitales
- **Section Motor**
  - En-tête avec `READ ALL` (contour vert) et `WRITE ALL` (contour rouge) à droite
  - Lignes de paramètres read-only : Status · Manufacturer · Model · Firmware · Voltage · Max Current
  - Badge `DISCONNECTED` rouge `#c0392b` quand non connecté, badge `CONNECTED` vert quand connecté

### 2. Settings (onglet SETTINGS)

#### Barre d'onglets interne (en haut)

5 onglets avec icône SVG + label sous l'icône. Onglet actif : icône et label en bleu `#3a7bd5`, ligne bleue sous l'onglet. Inactif : gris `#555`.

| Onglet | Icône | Contenu |
|--------|-------|---------|
| GENERAL | Cycliste (style Speeeed) | Low Battery Protection, Current Limit, Assist Levels count, Wheel Diameter, Speed Meter Type, Speed Meter Signals |
| LEVELS | Compteur vitesse | Tableau 10 niveaux (Level / Current / Speed) avec toggles %↔A et %↔km/h |
| PEDAL | Engrenage/roue | Pedal Sensor Type, Assist Level, Speed Limit, Start Current, Slow Start Mode, Start Degree, Stop Delay, Current Decay, Stop Decay, Keep Current |
| THROTTLE | Demi-cercle + aiguille | Start Voltage, End Voltage, Mode, Assist Level, Speed Limit, Start Current |
| TORQUE | Éclair/foudre | Tous les paramètres du bloc 0x55 (71 octets) |

#### Barre READ / WRITE

Sous les onglets internes, sur chaque page Settings :
- `READ` — bouton contour vert `#27ae60`
- Titre centré de la section (ex: "General")
- `WRITE` — bouton contour rouge `#e74c3c`

#### Lignes de paramètres

```
[Nom du paramètre]          [Valeur]
```
- Fond transparent
- Séparateur `#1e1e1e` entre chaque ligne
- Nom : couleur `#aaa`
- Valeur : couleur `#fff`, font-weight 500
- Tap sur une ligne → ouvre un picker/input pour modifier

### 3. Help (onglet HELP)

- Carte "About" : nom de l'app, version, description
- Carte "Connection" : instructions USB OTG
- Explication de chaque section de paramètres

## Tokens de style (CSS variables)

```css
--color-accent:      #3a7bd5;
--color-green:       #27ae60;
--color-red:         #e74c3c;
--color-danger:      #c0392b;
--color-bg:          #000000;
--color-surface:     #0d0d0d;
--color-surface-2:   #111111;
--color-border:      #1e1e1e;
--color-text:        #ffffff;
--color-text-muted:  #aaaaaa;
--color-text-dim:    #555555;
```

## Composants à créer / modifier

| Composant | Action |
|-----------|--------|
| `App.tsx` | Retirer l'onglet Display, ajouter Help, garder Home + Settings |
| `theme/variables.css` | Remplacer toutes les variables CSS par les tokens ci-dessus |
| `pages/Home.tsx` | Redesign complet (connexion + motor info) |
| `pages/SettingsPage.tsx` | Devient le conteneur des 5 onglets internes |
| `pages/BasicPage.tsx` | Renommer → GeneralPage, retirer le tableau Assist |
| `pages/AssistLevelsPage.tsx` | Nouveau — contient le tableau + toggles |
| `pages/PedalPage.tsx` | Redesign (style flat rows) |
| `pages/ThrottlePage.tsx` | Redesign (style flat rows) |
| `pages/TorquePage.tsx` | Redesign (style flat rows) |
| `pages/HelpPage.tsx` | Nouveau |
| `components/ParameterRow.tsx` | Refactor — style flat Speeeed |
| `components/ReadWriteBar.tsx` | Nouveau — barre READ/WRITE réutilisable |
| `components/InnerTabs.tsx` | Nouveau — barre 5 onglets Settings |

## Ce qui est supprimé

- `pages/ConnectionPage.tsx` — remplacé par section dans Home
- `pages/InfoPage.tsx` — remplacé par section Motor dans Home
- Onglet Display entier

## Contraintes techniques

- Ionic 8 + React 18 + TypeScript
- Capacitor 8 pour USB série
- Dark mode uniquement (pas de toggle light/dark — simplifie le design)
- Toutes les pages Settings partagent la même barre d'onglets interne


# Prüfungserfassung (Test) – BAV Prüfprotokoll (Optik)

Diese Testversion stellt ein **druckfähiges Webformular** bereit, das sich optisch am BAV Prüfprotokoll (Anhang 9) orientiert.

## Features
- Startmodus: **HPP (Praxis)**
- Optik: **Option A** – HTML/CSS nachgebaut, A4 Drucklayout mit 2 Seiten
- Pflichtregel: **HPP erfordert mindestens ein Fahrzeug (Baureihen-Code)**
- Zwei Unterschriftenfelder (Canvas): Prüfungsexperte und Prüfling
- Export: JSON-Download (für späteren Power-Automate-Import)

## GitHub Pages aktivieren
1. Repo öffnen → *Settings* → *Pages*
2. Source: `Deploy from a branch`
3. Branch: `main` / Folder: `/ (root)`
4. URL öffnen.

## Stammdaten
Siehe `assets/docs/assets_info.md`.

## Hinweis
- Keine Personendaten ins Repo committen.
- Webhook/Power Automate ist vorbereitet, aber standardmässig deaktiviert.

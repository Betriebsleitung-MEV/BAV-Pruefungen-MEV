
# KRA – Kurz-Risikoanalyse
**Applikation:** BAV-Prüfungserfassung (Web-App)
**Version:** Teststand
**Datum:** 2026-03-27

## 1. Zweck
Die Applikation dient der Erfassung von Prüfungsdaten (HPP/PP Theorie) inkl. Unterschriften und strukturiertem Export (JSON) für die Weiterverarbeitung (z. B. SharePoint / Power Automate). Es erfolgt keine automatische Bewertung, Genehmigung oder Archivierung.

## 2. Systemgrenzen
- Frontend-Webanwendung (GitHub Pages)
- Keine serverseitige Verarbeitung
- Keine automatische Datenübermittlung ohne Benutzeraktion
- Speicherung lokal (Download) bzw. später gesteuert

## 3. Rollen
- **PEX (Prüfungsexperte):** Erfassung, Unterschrift
- **Prüfling:** Unterschrift
- **Admin:** Pflege Stammdaten (JSON)

## 4. Risiken und Massnahmen
| Risiko | Beschreibung | Einstufung | Massnahmen |
|------|--------------|------------|------------|
| R1 | Falsche Personenauswahl | mittel | Auswahl aus AB-Akten, VTE10-Regel mit Pflichtfeldern |
| R2 | Unvollständige Daten | mittel | Pflichtfeld-Validierung, Abschlussbereich erst am Ende |
| R3 | Verlust von Daten | gering | Benutzerinitierter Download (JSON), kein Auto-Save |
| R4 | Unberechtigte Nutzung | gering | Öffentliche Test-URL, produktiv getrennte Ablage |
| R5 | Fehlinterpretation als Freigabe | mittel | Klarer Hinweis: Erfassung ≠ Genehmigung |

## 5. Datenschutz
- Verarbeitung personenbezogener Daten begrenzt auf Prüfzweck
- Keine Hintergrundübertragung
- Ablage/Weiterverarbeitung ausserhalb der App geregelt

## 6. Fazit
Das Restrisiko wird als **akzeptabel** eingestuft. Die App ist für Test- und Pilotbetrieb geeignet. Produktiver Einsatz nur mit organisatorischen Begleitmassnahmen (Zugriffsregelung, Ablagekonzept).

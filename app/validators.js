import { cleanCodesCSV } from './utils.js';

export function validateHPP(state){
  const errors = [];

  const fs = (state.mitarbeiter.fuehrerscheinnummer || '').trim();
  const name = (state.mitarbeiter.name || '').trim();
  const vorname = (state.mitarbeiter.vorname || '').trim();
  const geb = (state.mitarbeiter.geburtsdatum || '').trim();

  if(!name) errors.push('Name fehlt.');
  if(!vorname) errors.push('Vorname fehlt.');
  if(!fs && !geb) errors.push('VTE 10: Ohne Führerscheinnummer ist das Geburtsdatum Pflicht.');

  if(!state.pruefung.hauptfahrzeug_code) errors.push('HPP: Mindestens ein Fahrzeug (Baureihen-Code) muss erfasst werden.');

  if(!state.unterschriften.pruefer_base64png) errors.push('Unterschrift Prüfungsexperte fehlt.');
  if(!state.unterschriften.pruefling_base64png) errors.push('Unterschrift geprüfte Person fehlt.');

  state.selbstauskunft.weitere_fahrzeuge_codes = cleanCodesCSV(state.selbstauskunft.weitere_fahrzeuge_codes_raw || '');

  return { ok: errors.length === 0, errors };
}

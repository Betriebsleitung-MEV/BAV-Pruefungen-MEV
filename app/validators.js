import { cleanCodesCSV } from './utils.js';

export function validateHPP(state){
  const errors = [];
  if(!state.mitarbeiter.fuehrerscheinnummer) errors.push('Führerscheinnummer fehlt.');
  if(!state.mitarbeiter.name || !state.mitarbeiter.vorname) errors.push('Name/Vorname fehlt.');
  if(!state.pruefung.hauptfahrzeug_code) errors.push('HPP: Mindestens ein Fahrzeug (Baureihen-Code) muss erfasst werden.');
  if(!state.unterschriften.pruefer_base64png) errors.push('Unterschrift Prüfungsexperte fehlt.');
  if(!state.unterschriften.pruefling_base64png) errors.push('Unterschrift geprüfte Person fehlt.');

  // optional: check extra vehicles are codes
  const extras = cleanCodesCSV(state.selbstauskunft.weitere_fahrzeuge_codes_raw || '');
  state.selbstauskunft.weitere_fahrzeuge_codes = extras;

  return { ok: errors.length === 0, errors };
}

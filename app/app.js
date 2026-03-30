import { CONFIG } from './config.js';
import { qs, qsa, cleanCodesCSV } from './utils.js';
import { loadJSON } from './dataLoader.js';
import { SignPad } from './signpad.js';
import { validateHPP } from './validators.js';
import { downloadJSON } from './exporter.js';

const state = {
  mitarbeiter: {
    fuehrerscheinart: '',
    fuehrerscheinnummer: '',
    name: '',
    vorname: '',
    geburtsdatum: ''
  },
  pruefung: {
    pruefart: 'HPP',
    datum: '',
    pruefer_name: '',
    pruefer_bav: '',
    hauptfahrzeug_code: '',
    evu_bv_codes: [],
    netzteil_codes: []
  },
  praxis: {
    fahrten: [],
    leistungsqualifizierung: 'gut',
    begruendung: '',
    ergebnis: 'bestanden',
    ort: '',
    ortdatum: ''
  },
  selbstauskunft: {
    weitere_fahrzeuge_codes_raw: '',
    weitere_fahrzeuge_codes: [],
    hinweis: ''
  },
  unterschriften: {
    pruefer_base64png: '',
    pruefling_base64png: ''
  }
};

let signPex, signPruefling;

function setStatus(msg, ok=true){
  const s = qs('#status');
  if(!s) return;
  s.className = 'status ' + (ok ? 'status--ok' : 'status--err');
  s.textContent = msg;
}

function syncMirrorFields(){
  const a2 = qs('#ausweisNr2');
  if(a2) a2.value = qs('#fsNr').value;
}

function renderChipCheckboxes(containerSel, items){
  const el = qs(containerSel);
  if(!el) return;
  el.innerHTML = '';

  (items || []).forEach(item => {
    const code = (typeof item === 'string') ? item : item.code;
    if(!code) return;

    const label = document.createElement('label');
    label.className = 'chip';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = code;

    const span = document.createElement('span');
    span.textContent = code;

    label.appendChild(cb);
    label.appendChild(span);
    el.appendChild(label);
  });
}

function buildFahrtenRow(){
  const tr = document.createElement('tr');
  const fields = [
    {k:'dienstart', type:'select', opts:['','SD','ZV','RD','T']},
    {k:'zug_nummer', type:'text'},
    {k:'von', type:'text'},
    {k:'bis', type:'text'},
    {k:'vmax', type:'text'},
    {k:'anh_last_t', type:'text'},
    {k:'km', type:'text'}
  ];

  fields.forEach(f=>{
    const td = document.createElement('td');
    let el;
    if(f.type==='select'){
      el = document.createElement('select');
      f.opts.forEach(o=>{
        const op = document.createElement('option');
        op.value = o; op.textContent = o || '—';
        el.appendChild(op);
      });
    } else {
      el = document.createElement('input');
      el.type = 'text';
    }
    el.dataset.key = f.k;
    td.appendChild(el);
    tr.appendChild(td);
  });

  const tdDel = document.createElement('td');
  tdDel.classList.add('no-print');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--small';
  btn.textContent = '×';
  btn.addEventListener('click', ()=> tr.remove());
  tdDel.appendChild(btn);
  tr.appendChild(tdDel);

  return tr;
}

function collectFahrten(){
  const tbody = qs('#fahrtenTable tbody');
  if(!tbody) return [];
  return qsa('#fahrtenTable tbody tr').map(tr=>{
    const obj = {};
    qsa('input,select', tr).forEach(el=> obj[el.dataset.key] = el.value);
    return obj;
  }).filter(r => Object.values(r).some(v => String(v||'').trim() !== ''));
}

function collectState(){
  state.mitarbeiter.fuehrerscheinart = qs('#fsArt').value;
  state.mitarbeiter.fuehrerscheinnummer = qs('#fsNr').value.trim();
  state.mitarbeiter.name = qs('#name').value.trim();
  state.mitarbeiter.vorname = qs('#vorname').value.trim();
  state.mitarbeiter.geburtsdatum = qs('#gebdatum').value || '';

  state.pruefung.datum = qs('#datum2').value || '';
  state.pruefung.pruefer_name = qs('#pexName').value.trim();
  state.pruefung.pruefer_bav = qs('#pexBav').value.trim();
  state.pruefung.hauptfahrzeug_code = qs('#hauptfahrzeug').value;

  state.pruefung.evu_bv_codes = qsa('#evuList input[type=checkbox]:checked').map(x=>x.value);
  state.pruefung.netzteil_codes = qsa('#netzList input[type=checkbox]:checked').map(x=>x.value);

  state.praxis.fahrten = collectFahrten();
  const q = document.querySelector('input[name=qual]:checked');
  state.praxis.leistungsqualifizierung = q ? q.value : 'gut';
  const r = document.querySelector('input[name=result]:checked');
  state.praxis.ergebnis = r ? r.value : 'bestanden';
  state.praxis.begruendung = qs('#begruendung2').value;
  state.praxis.ort = qs('#ort2').value;
  state.praxis.ortdatum = qs('#ortdatum2').value;

  state.selbstauskunft.weitere_fahrzeuge_codes_raw = qs('#weitereFahrzeuge').value;
  state.selbstauskunft.hinweis = qs('#selbHinweis').value;
  state.selbstauskunft.weitere_fahrzeuge_codes = cleanCodesCSV(state.selbstauskunft.weitere_fahrzeuge_codes_raw);

  state.unterschriften.pruefer_base64png = signPex.toDataURL();
  state.unterschriften.pruefling_base64png = signPruefling.toDataURL();

  return JSON.parse(JSON.stringify(state));
}

function updateAbschlussVisibility(){
  const panel = qs('#abschlussActions');
  if(!panel) return;
  try {
    const payload = collectState();
    const res = validateHPP(payload);
    panel.hidden = !res.ok;
  } catch {
    panel.hidden = true;
  }
}

async function initData(){
  const baureihen = await loadJSON(CONFIG.dataPaths.baureihen);
  const evu = await loadJSON(CONFIG.dataPaths.evuBv);
  let netzteile = [];
  try { netzteile = await loadJSON(CONFIG.dataPaths.netzteile); } catch { netzteile = []; }

  const sel = qs('#hauptfahrzeug');
  sel.innerHTML = '';
  const op0 = document.createElement('option');
  op0.value = ''; op0.textContent = '—';
  sel.appendChild(op0);
  baureihen.forEach(code=>{
    const op = document.createElement('option');
    op.value = code;
    op.textContent = code;
    sel.appendChild(op);
  });

  renderChipCheckboxes('#evuList', evu);
  renderChipCheckboxes('#netzList', netzteile);
}

function initSignatures(){
  signPex = new SignPad(qs('#sigPex'));
  signPruefling = new SignPad(qs('#sigPruefling'));

  qsa('[data-clear]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-clear');
      if(id==='sigPex') signPex.clear();
      if(id==='sigPruefling') signPruefling.clear();
      updateAbschlussVisibility();
    });
  });

  qs('#sigPex')?.addEventListener('pointerup', updateAbschlussVisibility);
  qs('#sigPruefling')?.addEventListener('pointerup', updateAbschlussVisibility);
}

function bindUI(){
  qs('#fsNr')?.addEventListener('input', ()=>{ syncMirrorFields(); updateAbschlussVisibility(); });
  ['#name','#vorname'].forEach(id=> qs(id)?.addEventListener('input', updateAbschlussVisibility));
  qs('#gebdatum')?.addEventListener('change', updateAbschlussVisibility);
  qs('#pexName')?.addEventListener('input', updateAbschlussVisibility);
  qs('#pexBav')?.addEventListener('input', updateAbschlussVisibility);
  qs('#hauptfahrzeug')?.addEventListener('change', updateAbschlussVisibility);
  qs('#weitereFahrzeuge')?.addEventListener('input', updateAbschlussVisibility);

  document.addEventListener('change', (e)=>{
    if(e.target && e.target.matches('#evuList input[type=checkbox], #netzList input[type=checkbox]')) updateAbschlussVisibility();
  });

  const today = new Date();
  const pad = (n)=> String(n).padStart(2,'0');
  const iso = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
  qs('#datum2').value = iso;
  qs('#ortdatum2').value = iso;

  const tbody = qs('#fahrtenTable tbody');
  tbody.appendChild(buildFahrtenRow());
  qs('#btnAddFahrt')?.addEventListener('click', ()=> tbody.appendChild(buildFahrtenRow()));

  qs('#btnPrint')?.addEventListener('click', ()=> window.print());
  qs('#btnReset')?.addEventListener('click', ()=>{ if(confirm('Alles zurücksetzen?')) window.location.reload(); });
  qs('#btnExport')?.addEventListener('click', ()=>{
    const payload = collectState();
    const res = validateHPP(payload);
    if(!res.ok){ setStatus('Fehler: ' + res.errors.join(' '), false); return; }
    const key = payload.mitarbeiter.fuehrerscheinnummer || `${payload.mitarbeiter.name}_${payload.mitarbeiter.vorname}`;
    downloadJSON(payload, key);
    setStatus('Export OK. JSON wurde heruntergeladen.', true);
  });

  syncMirrorFields();
  updateAbschlussVisibility();
}

(async function main(){
  try{
    await initData();
    initSignatures();
    bindUI();
    setStatus('Bereit. Abschluss erscheint erst am Ende.', true);
  } catch(e){
    setStatus('Initialisierungsfehler: ' + e.message, false);
  }
})();

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
    bav_nummer: ''
  },
  pruefung: {
    pruefart: 'HPP',
    datum: '',
    pruefer_name: '',
    pruefer_bav: '',
    pruefer_id: '',
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
let baureihen = [];
let evu = [];

function setStatus(msg, ok=true){
  const s = qs('#status');
  s.className = 'status ' + (ok ? 'status--ok' : 'status--err');
  s.textContent = msg;
}

function syncMirrorFields(){
  // copy FS number into page 2 field
  qs('#ausweisNr2').value = qs('#fsNr').value;
}

function buildFahrtenRow(data={}){
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
        const op=document.createElement('option');
        op.value=o; op.textContent=o||'—';
        el.appendChild(op);
      });
      el.value = data[f.k] || '';
    } else {
      el = document.createElement('input');
      el.type = 'text';
      el.value = data[f.k] || '';
    }
    el.dataset.key = f.k;
    td.appendChild(el);
    tr.appendChild(td);
  });

  const tdDel = document.createElement('td');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--small';
  btn.textContent = '×';
  btn.title = 'Zeile löschen';
  btn.addEventListener('click', ()=> tr.remove());
  tdDel.appendChild(btn);
  tdDel.classList.add('no-print');
  tr.appendChild(tdDel);

  return tr;
}

function collectFahrten(){
  const rows = qsa('#fahrtenTable tbody tr');
  return rows.map(tr=>{
    const obj = {};
    qsa('input,select', tr).forEach(el=>{ obj[el.dataset.key] = el.value; });
    return obj;
  }).filter(r=> Object.values(r).some(v=>String(v||'').trim()!==''));
}

async function initData(){
  baureihen = await loadJSON(CONFIG.dataPaths.baureihen);
  evu = await loadJSON(CONFIG.dataPaths.evuBv);

  // Baureihen dropdown
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

  // EVU chips
  const list = qs('#evuList');
  list.innerHTML = '';
  evu.forEach(code=>{
    const lab = document.createElement('label');
    lab.className = 'chip';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = code;
    cb.addEventListener('change', ()=>{
      // no-op; collected on export
    });
    const sp = document.createElement('span');
    sp.textContent = code;
    lab.appendChild(cb);
    lab.appendChild(sp);
    list.appendChild(lab);
  });
}

function initSignatures(){
  signPex = new SignPad(qs('#sigPex'));
  signPruefling = new SignPad(qs('#sigPruefling'));

  qsa('[data-clear]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-clear');
      if(id==='sigPex') signPex.clear();
      if(id==='sigPruefling') signPruefling.clear();
    });
  });
}

function collectState(){
  // Mitarbeitende
  state.mitarbeiter.fuehrerscheinart = qs('#fsArt').value;
  state.mitarbeiter.fuehrerscheinnummer = qs('#fsNr').value.trim();
  state.mitarbeiter.name = qs('#name').value.trim();
  state.mitarbeiter.vorname = qs('#vorname').value.trim();
  state.mitarbeiter.bav_nummer = ''; // optional später

  // Prüfung
  state.pruefung.pruefart = 'HPP';
  state.pruefung.datum = qs('#datum2').value || '';
  state.pruefung.pruefer_name = qs('#pexName').value.trim();
  state.pruefung.pruefer_bav = qs('#pexBav').value.trim();
  state.pruefung.pruefer_id = state.pruefung.pruefer_bav ? `PEX-${state.pruefung.pruefer_bav}` : '';
  state.pruefung.hauptfahrzeug_code = qs('#hauptfahrzeug').value;

  // EVU list
  state.pruefung.evu_bv_codes = qsa('#evuList input[type=checkbox]:checked').map(x=>x.value);

  // Netzteile (free text -> codes list)
  state.pruefung.netzteil_codes = cleanCodesCSV(qs('#netzteile').value);

  // Praxis
  state.praxis.fahrten = collectFahrten();
  const q = document.querySelector('input[name=qual]:checked');
  state.praxis.leistungsqualifizierung = q ? q.value : 'gut';
  const r = document.querySelector('input[name=result]:checked');
  state.praxis.ergebnis = r ? r.value : 'bestanden';
  state.praxis.begruendung = qs('#begruendung2').value;
  state.praxis.ort = qs('#ort2').value;
  state.praxis.ortdatum = qs('#ortdatum2').value;

  // Selbstauskunft
  state.selbstauskunft.weitere_fahrzeuge_codes_raw = qs('#weitereFahrzeuge').value;
  state.selbstauskunft.hinweis = qs('#selbHinweis').value;

  // Unterschriften
  state.unterschriften.pruefer_base64png = signPex.toDataURL();
  state.unterschriften.pruefling_base64png = signPruefling.toDataURL();

  return JSON.parse(JSON.stringify(state));
}

function bindUI(){
  // Mirror FS number
  qs('#fsNr').addEventListener('input', syncMirrorFields);
  syncMirrorFields();

  // default dates
  const today = new Date();
  const pad = (n)=> String(n).padStart(2,'0');
  const iso = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
  qs('#datum2').value = iso;
  qs('#ortdatum2').value = iso;

  // Fahrten default row
  const tbody = qs('#fahrtenTable tbody');
  tbody.appendChild(buildFahrtenRow());

  qs('#btnAddFahrt').addEventListener('click', ()=>{
    tbody.appendChild(buildFahrtenRow());
  });

  qs('#btnPrint').addEventListener('click', ()=> window.print());

  qs('#btnReset').addEventListener('click', ()=>{
    if(confirm('Alles zurücksetzen?')){
      window.location.reload();
    }
  });

  qs('#btnExport').addEventListener('click', ()=>{
    try{
      const payload = collectState();
      const res = validateHPP(payload);
      if(!res.ok){
        setStatus('Fehler: ' + res.errors.join(' '), false);
        return;
      }
      // ensure selbstauskunft codes
      payload.selbstauskunft.weitere_fahrzeuge_codes = cleanCodesCSV(payload.selbstauskunft.weitere_fahrzeuge_codes_raw);
      downloadJSON(payload, payload.mitarbeiter.fuehrerscheinnummer);
      setStatus('Export OK. JSON wurde heruntergeladen.', true);
    } catch(e){
      setStatus('Fehler: ' + e.message, false);
    }
  });
}

(async function main(){
  try{
    await initData();
    initSignatures();
    bindUI();
    setStatus('Bereit. Bitte Formular ausfüllen und exportieren.', true);
  } catch(e){
    setStatus('Initialisierungsfehler: ' + e.message, false);
  }
})();

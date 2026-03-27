import { nowStamp } from './utils.js';

export function downloadJSON(payload, fsNr){
  const stamp = nowStamp();
  const safeFs = (fsNr || 'unbekannt').replace(/[^A-Za-z0-9_-]+/g,'_');
  const filename = `Pruefprotokoll_HPP_${safeFs}_${stamp}.json`;
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 200);
}

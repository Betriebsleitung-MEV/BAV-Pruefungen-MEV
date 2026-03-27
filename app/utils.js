export function qs(sel, root=document){
  const el = root.querySelector(sel);
  return el;
}
export function qsa(sel, root=document){
  return Array.from(root.querySelectorAll(sel));
}
export function toISODate(d){
  if(!d) return '';
  // if already yyyy-mm-dd
  if(/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  return d;
}
export function nowStamp(){
  const d = new Date();
  const pad = (n)=> String(n).padStart(2,'0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}
export function cleanCodesCSV(s){
  if(!s) return [];
  return s.split(/[,;
]+/).map(x=>x.trim()).filter(Boolean);
}

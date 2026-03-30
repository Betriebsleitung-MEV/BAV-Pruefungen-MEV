export function qs(sel, root=document){
  return root.querySelector(sel);
}

export function qsa(sel, root=document){
  return Array.from(root.querySelectorAll(sel));
}

export function nowStamp(){
  const d = new Date();
  const pad = (n)=> String(n).padStart(2,'0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

export function cleanCodesCSV(s){
  if(!s) return [];
  return s
    .split(/[,;\n]+/)
    .map(x => x.trim())
    .filter(Boolean);
}

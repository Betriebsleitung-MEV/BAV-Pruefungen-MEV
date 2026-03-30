export async function loadJSON(path){
  const res = await fetch(path, { cache: 'no-store' });
  if(!res.ok){
    throw new Error(`HTTP ${res.status} bei ${path}`);
  }
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    const head = txt.slice(0, 60).replace(/\s+/g,' ').trim();
    throw new Error(`JSON-Parse Fehler bei ${path} (Start: ${head})`);
  }
}

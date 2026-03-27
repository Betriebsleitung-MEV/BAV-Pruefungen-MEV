export async function loadJSON(path){
  const res = await fetch(path, {cache: 'no-store'});
  if(!res.ok) throw new Error(`Kann ${path} nicht laden (${res.status})`);
  return await res.json();
}

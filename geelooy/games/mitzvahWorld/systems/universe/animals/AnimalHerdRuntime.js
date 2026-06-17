// B"H
export function animalHerds(animals = []) { return Object.values(animals.reduce((a,x)=>{ const key=x.herd || x.species || "wild"; (a[key] ||= { herd:key, members:[] }).members.push(x.id); return a; }, {})); }

import { heroMaterial } from '../js/render/fighter/hero/converter/HeroMaterial.js';
const mat = heroMaterial('hsl(120 90% 60%)');
for (const key of ['accent','shell','shellSoft','shadow','ink','glint','panel']) {
  if (!mat[key]) throw new Error(`missing material ${key}`);
}
console.log(JSON.stringify({ ok: true, keys: Object.keys(mat) }, null, 2));

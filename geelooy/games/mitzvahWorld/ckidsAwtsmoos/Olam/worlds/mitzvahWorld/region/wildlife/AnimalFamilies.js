// B"H
/**
 * AnimalFamilies: herds have parents, young, elders, and memory.
 * Compatibility law: link(a,b,kind) remains for Emerald audits/postbuild.
 */
export class AnimalFamilies{
  constructor(){this.families=new Map();this.links=[];}
  ensure(id,species='animal'){if(!this.families.has(id))this.families.set(id,{id,species,parents:[],young:[],elders:[],members:[],births:0,losses:0,relations:[]});return this.families.get(id);}
  add(familyId,animal={}){const f=this.ensure(familyId,animal.species);const id=animal.id||String(animal);if(!f.members.includes(id))f.members.push(id);if(animal.age==='young'&&!f.young.includes(id))f.young.push(id);else if(animal.age==='elder'&&!f.elders.includes(id))f.elders.push(id);else if(f.parents.length<2&&!f.parents.includes(id))f.parents.push(id);return f;}
  link(a,b,kind='family',detail={}){const familyId=detail.familyId||`${kind}_${a}`;const f=this.ensure(familyId,detail.species||'animal');for(const id of [a,b])if(!f.members.includes(id))f.members.push(id);if(kind==='family'&&!f.young.includes(b))f.young.push(b);const row={a,b,kind,at:Date.now(),detail};f.relations.push(row);this.links.push(row);return row;}
  birth(familyId,id){const f=this.ensure(familyId);if(!f.young.includes(id))f.young.push(id);if(!f.members.includes(id))f.members.push(id);f.births++;return f;}
  loss(familyId,id){const f=this.ensure(familyId);f.members=f.members.filter(x=>x!==id);f.young=f.young.filter(x=>x!==id);f.elders=f.elders.filter(x=>x!==id);f.losses++;return f;}
  summary(){const records=[...new Set(this.links.flatMap(l=>[l.a,l.b]))].length;return{families:this.families.size,links:this.links.length,records,young:[...this.families.values()].reduce((a,f)=>a+f.young.length,0)};}
}
export default AnimalFamilies;

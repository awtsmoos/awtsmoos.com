// B"H
/** @file KosherAnimalIndex.js @description Educational kosher animal data for non-graphic gameplay. */
export const KosherAnimalIndex = Object.freeze({
  cow: { id:"cow", name:"Cow", kosherSpecies:true, yields:{ basar_shechuta:4, cow_hide:2, kosher_cow_leather:1 }, requiresShechitaKnife:true, tefillinLeather:true },
  goat: { id:"goat", name:"Goat", kosherSpecies:true, yields:{ basar_shechuta:2, cow_hide:1 }, requiresShechitaKnife:true, tefillinLeather:false },
  deer: { id:"deer", name:"Deer", kosherSpecies:true, yields:{ basar_shechuta:2, fur_scrap:1 }, requiresShechitaKnife:true, tefillinLeather:false },
  fox: { id:"fox", name:"Fox", kosherSpecies:false, yields:{ fur_scrap:2, non_kosher_meat:1 }, requiresShechitaKnife:false, tefillinLeather:false }
});
export function animalKosherData(species) { return KosherAnimalIndex[species] || { id:species || "unknown", name:species || "Animal", kosherSpecies:false, yields:{ fur_scrap:1 }, requiresShechitaKnife:false, tefillinLeather:false }; }
export default KosherAnimalIndex;

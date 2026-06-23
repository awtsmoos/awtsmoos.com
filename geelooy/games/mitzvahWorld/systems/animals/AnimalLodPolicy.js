// B"H
export function animalLodPolicy(distance=0){if(distance<70)return{lod:"near",skinned:true,hz:12,quality:1};if(distance<180)return{lod:"mid",skinned:true,hz:5,quality:.7};if(distance<420)return{lod:"far",skinned:false,hz:1,quality:.38};return{lod:"horizon",skinned:false,hz:0,quality:.12}}
export default animalLodPolicy;

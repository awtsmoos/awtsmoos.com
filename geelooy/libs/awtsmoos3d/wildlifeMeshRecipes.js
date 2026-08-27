// B"H
/** @file wildlifeMeshRecipes.js @description Simple procedural wildlife mesh recipe hooks. */
export function wildlifeMeshRecipe(species){return {species,parts:['body','head','legs','tail'],animation:['idle','walk','run','graze','flee']};}

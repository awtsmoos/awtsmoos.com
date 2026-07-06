// B"H
export function generateAnimalMaterials(genome) {
  const species = genome?.species || "fox";
  const coat = genome?.archetype?.coat || genome?.archetype?.skin || genome?.archetype?.feathers || ["brown"];
  return {
    species,
    layers:[
      { id:"baseCoat", kind:"opaqueMeshLambert", color:coat[0], roughness:.9 },
      { id:"bellyPatch", kind:"paintedMarking", color:coat[1] || "cream", coverage:.22 },
      { id:"speciesMarkings", kind:"proceduralMarkings", density:genome?.variation?.markingDensity ?? .5 },
      { id:"eyes", kind:"glossEye", color:"black" }
    ],
    noBrokenPointsMaterial:true,
    pointsMaterialUsed:false
  };
}

export default { generateAnimalMaterials };

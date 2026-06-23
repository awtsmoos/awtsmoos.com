// B"H
export function edgeWearIntent(kind="wall"){return{kind,edgeHighlight:kind!=="ui",cavityDirt:true,cornerWear:["wall","roof","bark","terrain"].includes(kind),strength:kind==="animal"?.08:.18}}
export default edgeWearIntent;

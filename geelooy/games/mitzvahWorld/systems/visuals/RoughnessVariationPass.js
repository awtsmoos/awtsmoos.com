// B"H
export function roughnessVariation(kind="default"){const range={animal:[.68,.9],wall:[.78,.98],roof:[.72,.95],terrain:[.82,1],bark:[.8,.98]}[kind]||[.7,.95];return{kind,min:range[0],max:range[1],noiseScale:kind==="terrain"?24:8}}
export default roughnessVariation;

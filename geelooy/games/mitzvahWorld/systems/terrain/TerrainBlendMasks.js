// B"H
export function blendMasks({height=0,slope=0,moisture=.5,noise=.5}={}){return{grass:Math.max(0,1-slope)*moisture,stone:Math.min(1,slope+.02*height),dirt:Math.min(1,(1-moisture)*.7+noise*.3),path:0,edgeWear:Math.min(1,slope*1.2)}}
export default {blendMasks};

// B"H
export function dirtWearForSurface({traffic=0,moisture=.4,edgeExposure=.5,age=.5}={}){return{dust:Math.max(0,(1-moisture)*age*.8),mud:Math.max(0,moisture*traffic*.75),edgeWear:Math.min(1,edgeExposure*(.25+age*.75)),cavityDirt:Math.min(1,(traffic*.35+age*.65)*(.4+moisture*.6)),footPolish:Math.min(1,traffic*(1-moisture))}}
export function stampDirtIntent(material,params){if(!material)return null;material.userData||={};material.userData.proceduralDirtWear=dirtWearForSurface(params);material.needsUpdate=true;return material.userData.proceduralDirtWear}
export default {dirtWearForSurface,stampDirtIntent};

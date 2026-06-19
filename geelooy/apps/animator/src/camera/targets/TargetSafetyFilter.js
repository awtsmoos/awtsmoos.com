// B"H
export class TargetSafetyFilter{static apply(targets=[],state){if(targets.length)return targets.filter(t=>t&&Number.isFinite(t.position?.x));const chars=state?.get?.('characters')||{};return Object.values(chars).map(c=>({id:c.id,type:'actor',role:'fallback',position:c.position||{},bounds:{x:c.position?.x||0,y:(c.position?.y||0)-90,w:90,h:210},priority:1,raw:c}));}}

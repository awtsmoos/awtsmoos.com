/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
export function poseReadback(pose){return Object.fromEntries(Object.entries(pose).filter(([,v])=>v&&Number.isFinite(v.x)&&Number.isFinite(v.y)).map(([k,v])=>[k,{x:Math.round(v.x*10)/10,y:Math.round(v.y*10)/10}]))}

/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
export function updateLimbMemory(f,pose){const mem=f.poseMemory||={points:{}};for(const [name,p] of Object.entries(pose)){if(!p||!Number.isFinite(p.x))continue;const old=mem.points[name]||{x:p.x,y:p.y,vx:0,vy:0};old.vx=p.x-old.x;old.vy=p.y-old.y;old.x=p.x;old.y=p.y;mem.points[name]=old}return mem}
export function memoryVelocity(f,name){return f.poseMemory?.points?.[name]||{vx:0,vy:0}}

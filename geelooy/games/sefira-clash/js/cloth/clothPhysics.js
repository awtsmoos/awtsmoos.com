/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function stepChain(chain,anchor,profile,vx=0,vy=0){if(!chain.length)return chain;chain[0].x=anchor.x;chain[0].y=anchor.y;for(let i=1;i<chain.length;i++){const p=chain[i],q=chain[i-1];p.x+=-vx*.08*profile.drag;p.y+=profile.gravity-vy*.025;const dx=p.x-q.x,dy=p.y-q.y,l=Math.hypot(dx,dy)||1;if(l>profile.length){p.x=q.x+dx/l*profile.length;p.y=q.y+dy/l*profile.length}}return chain}

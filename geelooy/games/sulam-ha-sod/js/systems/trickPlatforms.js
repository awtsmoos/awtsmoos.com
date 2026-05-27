// B"H
/**
 * Chapter 33: the liar-platform was forced to confess its true identity.
 * Collision bodies are copies, so landing must trace back to the live stone;
 * the Awtsmoos does not let a shattered illusion survive in a copied mask.
 */
export class TrickPlatformField {
  /** @param {Array<object>} tricks deceptive platforms */
  constructor(tricks=[]){
    this.platforms = tricks.map((p,i)=>({...p,id:i,baseX:p.x,baseY:p.y,t:0,broken:0,cooldown:p.delay||0,armed:true,alpha:1}));
  }
  /** @param {number} dt seconds @param {object} player hero body */
  step(dt, player){
    for(const p of this.platforms){
      p.t += dt; if(p.broken>0){ p.broken -= dt; if(p.broken<=0){ p.x=p.baseX; p.y=p.baseY; p.alpha=1; p.armed=true; } continue; }
      if(p.kind === 'ambush'){
        p.cooldown -= dt;
        const near = Math.abs((player.x+player.w/2)-(p.baseX+p.w/2)) < (p.range||90);
        if(near && p.cooldown <= 0){ p.y = p.baseY - (p.jump||80); p.cooldown = p.reset || 2.4; }
        else p.y += (p.baseY - p.y) * Math.min(1, dt * 5);
      }
      if(p.kind === 'vanish') p.alpha = .35 + Math.abs(Math.sin(p.t*3))*.65;
    }
  }
  /** @returns {Array<object>} collision bodies currently present */
  bodies(){ return this.platforms.filter(p=>p.broken<=0 && p.alpha !== 0).map(p=>({...p,warn:p.kind})); }
  /** @param {object} body copied or live trick platform landed upon */
  land(body){
    const p = this.platforms.find(item => item.id === body.id) || body;
    if(p.kind === 'shatter' && p.armed){ p.armed=false; p.broken=p.reform||2.2; p.alpha=0; return 'The platform shattered like a nervous secret.'; }
    if(p.kind === 'vanish' && p.armed){ p.armed=false; p.broken=p.reform||1.5; p.alpha=0; return 'The platform blinked out of the dream.'; }
    if(p.kind === 'ambush') return 'The ordinary block jumped like it owed money.';
    return '';
  }
}

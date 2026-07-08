// B"H
import Coin from '../coin.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/**
 * Greedy bait coin that flees toward danger.
 */
export default class GreedyCoin extends Coin {
  type='greedyCoin';
  static itemName='Greedy Coin';

  constructor(op={},olam){
    super({...op,color:0xff44aa},olam);
    this.fleeRadius=op.fleeRadius||7;
    this.speed=op.speed||0.16;
    this.trapTarget=op.trapTarget||{x:(op.position?.x||0)+8,z:(op.position?.z||0)};
    this.stopDistance=op.stopDistance||1.7;
    this.heesHawveh=true;
  }

  heesHawvoos(){
    const player=this.olam?.chossid;
    if(!player?.mesh||!this.mesh) return;
    const dx=player.mesh.position.x-this.mesh.position.x;
    const dz=player.mesh.position.z-this.mesh.position.z;
    const dist=Math.hypot(dx,dz);
    if(dist>this.fleeRadius) return;

    const tx=this.trapTarget.x-this.mesh.position.x;
    const tz=this.trapTarget.z-this.mesh.position.z;
    const td=Math.hypot(tx,tz);

    if(td>this.stopDistance){
      this.mesh.position.x += (tx/td)*this.speed;
      this.mesh.position.z += (tz/td)*this.speed;
    }

    this.mesh.position.y += Math.sin(performance.now()/180)*0.01;
  }
}

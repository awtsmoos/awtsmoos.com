// B"H
import SpikeHazard from './SpikeHazard.js';

/**
 * A coin-shaped spike. It can flee like treasure, then punish like judgment.
 */
export default class SpikeCoin extends SpikeHazard {
  type='spikeCoin';
  static itemName='Spike Coin';

  constructor(op={},olam){
    op.radius=op.radius||0.42;
    op.height=op.height||0.12;
    op.proximity=op.proximity||0.78;
    op.penalty=op.penalty||12;
    op.golem=op.golem||{
      guf:{CylinderGeometry:[0.42,0.42,0.12,16,1]},
      toyr:{MeshLambertMaterial:{color:op.color||0xffd700,emissive:0xaa3300,emissiveIntensity:0.65}}
    };
    super(op,olam);
    this.fleeRadius=op.fleeRadius||7;
    this.speed=op.speed||0.18;
    this.trapTarget=op.trapTarget||{x:(op.position?.x||0)+8,z:(op.position?.z||0)};
    this.stopDistance=op.stopDistance||1.25;
    this.heesHawveh=true;
  }

  heesHawvoos(){
    if(this.mesh) this.mesh.rotation.y += 0.055;
    const player=this.olam?.chossid;
    if(!player?.mesh||!this.mesh) return;
    const dx=player.mesh.position.x-this.mesh.position.x;
    const dz=player.mesh.position.z-this.mesh.position.z;
    if(Math.hypot(dx,dz)>this.fleeRadius) return;
    const tx=this.trapTarget.x-this.mesh.position.x;
    const tz=this.trapTarget.z-this.mesh.position.z;
    const td=Math.hypot(tx,tz);
    if(td>this.stopDistance){
      this.mesh.position.x+=(tx/td)*this.speed;
      this.mesh.position.z+=(tz/td)*this.speed;
      this.mesh.updateMatrixWorld(true);
    }
  }
}

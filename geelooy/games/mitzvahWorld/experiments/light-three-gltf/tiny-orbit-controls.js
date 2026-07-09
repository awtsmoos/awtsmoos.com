// B"H
/**
 * TinyOrbitControls: a reusable camera orbit vessel.
 * Touch or mouse pulls the camera around the chossid; wheel/pinch draws near.
 */
export class TinyOrbitControls{
  constructor(canvas,camera,{target=[0,.45,4.2],distance=6,theta=Math.PI,phi=1.42,minDistance=2,maxDistance=12}={}){this.canvas=canvas;this.camera=camera;this.target=target.slice();this.distance=distance;this.theta=theta;this.phi=phi;this.minDistance=minDistance;this.maxDistance=maxDistance;this.enabled=true;this.drag=null;this.pinch=0;this.bind();this.update();}
  bind(){const c=this.canvas;c.style.touchAction='none';c.addEventListener('pointerdown',e=>this.down(e));c.addEventListener('pointermove',e=>this.move(e));c.addEventListener('pointerup',e=>this.up(e));c.addEventListener('pointercancel',e=>this.up(e));c.addEventListener('wheel',e=>this.wheel(e),{passive:false});c.addEventListener('touchmove',e=>this.touch(e),{passive:false});}
  down(e){if(!this.enabled)return;this.canvas.setPointerCapture?.(e.pointerId);this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,theta:this.theta,phi:this.phi};}
  move(e){if(!this.drag||this.drag.id!==e.pointerId)return;const dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y;this.theta=this.drag.theta-dx*.007;this.phi=Math.max(.18,Math.min(Math.PI-.18,this.drag.phi+dy*.007));this.update();}
  up(e){if(this.drag?.id===e.pointerId)this.drag=null;this.pinch=0;}
  wheel(e){if(!this.enabled)return;e.preventDefault();this.distance=Math.max(this.minDistance,Math.min(this.maxDistance,this.distance*Math.exp(e.deltaY*.001)));this.update();}
  touch(e){if(e.touches.length!==2)return;e.preventDefault();const a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);if(this.pinch){this.distance=Math.max(this.minDistance,Math.min(this.maxDistance,this.distance*(this.pinch/d)));this.update();}this.pinch=d;}
  panTarget(dx=0,dy=0,dz=0){this.target[0]+=dx;this.target[1]+=dy;this.target[2]+=dz;this.update();}
  update(){const s=Math.sin(this.phi),x=this.target[0]+this.distance*s*Math.sin(this.theta),y=this.target[1]+this.distance*Math.cos(this.phi),z=this.target[2]+this.distance*s*Math.cos(this.theta);this.camera.position.set(x,y,z);this.camera.target=this.target.slice();}
  diagnostics(){return{distance:+this.distance.toFixed(3),theta:+this.theta.toFixed(3),phi:+this.phi.toFixed(3),target:this.target.map(v=>+v.toFixed(3))};}
}
export default TinyOrbitControls;

// B"H
import { ShotProfileLibrary } from './ShotProfileLibrary.js';
export class PortraitCompositionSolver { static apply(cam={},shot='mediumShot'){const p=ShotProfileLibrary.get(shot);return{...cam,y:this.clamp(cam.y??p.y,112,148),zoom:this.clamp(cam.zoom??p.zoom,p.min,p.max)};} static clamp(v,a,b){return Math.max(a,Math.min(b,Number(v)));} }

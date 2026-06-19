// B"H
import { CameraClampSolver } from './CameraClampSolver.js';
import { ShotProfileLibrary } from './ShotProfileLibrary.js';
export class MobileSafeFrameSolver { static solve(cam={},safe={}){const shot=cam.shotType||cam.shot||'mediumShot';const p=ShotProfileLibrary.get(shot);const out={...cam,y:this.clamp(cam.y??p.y,108,150),zoom:this.clamp(cam.zoom??p.zoom,p.min,p.max)};return CameraClampSolver.clamp(out);} static clamp(v,a,b){return Math.max(a,Math.min(b,Number(v)));} }

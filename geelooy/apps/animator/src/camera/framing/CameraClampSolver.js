// B"H
import { ShotProfileLibrary } from './ShotProfileLibrary.js';
export class CameraClampSolver { static clamp(cam={}){const shot=cam.shotType||cam.shot||'mediumShot';const p=ShotProfileLibrary.get(shot);return{...cam,x:this.c(cam.x,-260,260,0),y:this.c(cam.y,104,154,p.y),zoom:this.c(cam.zoom,p.min,p.max,p.zoom),rotation:this.c(cam.rotation||cam.roll||0,-4,4,0)};} static c(v,a,b,f){const n=Number(v);return Math.max(a,Math.min(b,Number.isFinite(n)?n:f));} }

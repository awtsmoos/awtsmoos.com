// B"H
export class HatHeadroomSolver { static apply(cam={}, targets=[]){const hasHat=targets.some(t=>t.raw?.hatType||t.raw?.archetype==='sage');return hasHat?{...cam,y:Math.max(118,Number(cam.y||132)-4),zoom:Math.min(Number(cam.zoom||1),1.54)}:cam;} }

// B"H
export class TableAwareFrameSolver { static apply(cam={}, profile={}){ if(!profile.table) return cam; return {...cam,y:Math.max(124,Math.min(142,Number(cam.y||132))),zoom:Math.min(Number(cam.zoom||1),profile.max||1.3)}; } }

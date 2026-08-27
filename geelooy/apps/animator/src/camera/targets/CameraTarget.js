// B"H
export class CameraTarget{static make(p={}){return{id:p.id,type:p.type||'point',role:p.role||'subject',priority:Number(p.priority||1),position:p.position||{x:p.x||0,y:p.y||0},bounds:p.bounds||null,raw:p.raw||p};}}

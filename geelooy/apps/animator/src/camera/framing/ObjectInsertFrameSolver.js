// B"H
export class ObjectInsertFrameSolver{static frame(targets=[]){const obj=targets.find(t=>t.type==='prop')||targets[0];return{x:obj?.position?.x||0,y:(obj?.position?.y||100)-18,zoom:1.55};}}

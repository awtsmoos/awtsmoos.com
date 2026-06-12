/**
 * B"H
 * Ruthless audit repair vessel: active hyper-real animation, visual-only.
 */
export function fearOvercorrection(p,f,intent,body){const s=body.height,k=intent.panic||0,face=f.face||1;if(k<.25)return p;p.hip.x-=face*5*k*s;p.head.x-=face*7*k*s;p.leftFoot.x-=face*10*k*s;p.rightFoot.x+=face*8*k*s;return p}

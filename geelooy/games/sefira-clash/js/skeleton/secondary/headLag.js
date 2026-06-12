/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function headLag(p,f,m,style,body){const s=body.height;p.head.x-=(m.turnTimer||0)*m.facing*7*s;p.head.y-=m.grounded?Math.min(3,m.horizontalSpeed*.15)*s:0;if(f.attack&&m.grounded)p.head.x+=m.facing*3*s;return p}

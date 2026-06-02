// B"H
/** Worker module: a tiny off-thread witness with gradient, arc, and bitmap. */
export function worker() {
  return `onmessage=()=>{const c=new OffscreenCanvas(108,54),x=c.getContext('2d');const g=x.createLinearGradient(0,0,108,0);['lime','cyan','blue','magenta'].forEach((v,i)=>g.addColorStop(i/3,v));x.fillStyle=g;x.fillRect(0,0,108,54);x.fillStyle='black';x.fillRect(12,12,38,23);x.strokeStyle='white';x.lineWidth=3;const p=new Path2D();p.arc(54,27,19,0,6.283);x.stroke(p);postMessage({ok:true,bitmap:c.transferToImageBitmap()});};`;
}

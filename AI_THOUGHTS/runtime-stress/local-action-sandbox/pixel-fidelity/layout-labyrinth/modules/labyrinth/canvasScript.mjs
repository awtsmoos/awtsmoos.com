// B"H
/**
 * Canvas script generator. Labels are reduced to one-character marks so MiniMax
 * cannot hallucinate clipped prose. The visible UI corpus is now DOM-based, so
 * this script paints only the canvas/browser primitives.
 */
export function canvasScript() {
  return `${helpers()}${paintAll()}`;
}

function helpers() {
  return `function rb(x,w,h){const g=x.createLinearGradient(0,0,w,0);['red','orange','yellow','lime','cyan','blue','magenta'].forEach((c,i)=>g.addColorStop(i/6,c));x.fillStyle=g;x.fillRect(0,0,w,h)}function label(x,t,y=18){x.fillStyle='white';x.font='14px sans-serif';x.fillText(t,8,y)}function lattice(id,t){const c=document.getElementById(id),x=c.getContext('2d');rb(x,c.width,c.height);x.fillStyle='rgba(0,0,0,.38)';x.fillRect(6,21,c.width-12,c.height-27);x.strokeStyle='white';x.lineWidth=2;x.strokeRect(5,5,c.width-10,c.height-10);for(let i=1;i<3;i++){x.beginPath();x.moveTo(5+i*(c.width-10)/3,5);x.lineTo(5+i*(c.width-10)/3,c.height-5);x.stroke();x.beginPath();x.moveTo(5,5+i*(c.height-10)/3);x.lineTo(c.width-5,5+i*(c.height-10)/3);x.stroke()}label(x,t)}`;
}

function paintAll() {
  return `const names={l0a:'A',l0b:'B',l0c:'C',wr0:'0',wr1:'1',wr2:'2',wr3:'3',mm0:'1',mm1:'2',mm2:'3',mm3:'4',ov0:'H',ov1:'Y',ov2:'X',ov3:'A',al0:'S',al1:'C',al2:'E',al3:'B',im0:'S',im1:'B',im2:'D'};Object.keys(names).forEach(id=>lattice(id,names[id]));paintAlignment();paintOverflow();paintImageChain();paintAbs();function paintAlignment(){[['al0',12],['al1',54],['al2',92],['al3',25]].forEach(([id,xp],i)=>{const c=document.getElementById(id),x=c.getContext('2d');x.fillStyle='rgba(0,0,0,.35)';x.fillRect(0,0,c.width,c.height);x.fillStyle=['#f40070','#00d9ff','#ffe14a','#00ff70'][i];x.fillRect(xp,9,16,16);x.strokeStyle='white';x.strokeRect(5,5,c.width-10,c.height-10);label(x,names[id],18)})}function paintOverflow(){['ov0','ov1','ov2','ov3'].forEach((id,i)=>{const c=document.getElementById(id),x=c.getContext('2d');x.fillStyle='#06101f';x.fillRect(0,0,c.width,c.height);x.strokeStyle='white';x.lineWidth=2;x.strokeRect(5,5,c.width-10,c.height-10);x.fillStyle='white';x.font='13px sans-serif';x.fillText(['H','Y','X','A'][i],10,22)})}function paintImageChain(){const a=document.getElementById('im0').getContext('2d');rb(a,112,44);a.fillStyle='white';a.fillRect(16,14,74,18);a.fillStyle='red';a.fillRect(20,18,18,10);a.fillStyle='cyan';a.fillRect(42,18,18,10);a.fillStyle='magenta';a.fillRect(64,18,18,10);label(a,'S');const src=new OffscreenCanvas(74,26),s=src.getContext('2d');rb(s,74,26);s.strokeStyle='white';s.strokeRect(4,4,66,18);s.fillStyle='black';s.fillRect(18,9,38,8);const bmp=src.transferToImageBitmap();['im1','im2'].forEach((id,i)=>{const x=document.getElementById(id).getContext('2d');x.fillStyle='#06101f';x.fillRect(0,0,112,44);x.drawImage(bmp,18+i*5,13,74,26);label(x,i?'D':'B')})}function paintAbs(){const c=document.getElementById('abs0'),x=c.getContext('2d');x.fillStyle='#06101f';x.fillRect(0,0,c.width,c.height);x.strokeStyle='white';x.strokeRect(4,4,c.width-8,c.height-8);x.fillStyle='white';x.font='13px sans-serif';x.fillText('Z',12,25)}`;
}

// B"H
/**
 * Client script: every label is short and loud. The Awtsmoos removes tiny
 * glyphs from deep cells and replaces them with big depth sigils, lattices,
 * overflow names, real UI miniatures, and a WebGL state cube.
 */
export function clientScript() {
  return `${helpers()}${paintCanvases()}${paintWebgl()}window.labState.ready=true;`;
}

function helpers() {
  return `window.labState={ready:false};function rb(x,w,h){const g=x.createLinearGradient(0,0,w,0);['red','orange','yellow','lime','cyan','blue','magenta'].forEach((c,i)=>g.addColorStop(i/6,c));x.fillStyle=g;x.fillRect(0,0,w,h)}function label(x,t,y=19){x.fillStyle='white';x.font='15px sans-serif';x.fillText(t,8,y)}function lattice(id,t){const c=document.getElementById(id),x=c.getContext('2d');rb(x,c.width,c.height);x.fillStyle='rgba(0,0,0,.38)';x.fillRect(6,22,c.width-12,c.height-28);x.strokeStyle='white';x.lineWidth=2;x.strokeRect(5,5,c.width-10,c.height-10);for(let i=1;i<3;i++){x.beginPath();x.moveTo(5+i*(c.width-10)/3,5);x.lineTo(5+i*(c.width-10)/3,c.height-5);x.stroke();x.beginPath();x.moveTo(5,5+i*(c.height-10)/3);x.lineTo(c.width-5,5+i*(c.height-10)/3);x.stroke()}label(x,t)}`;
}

function paintCanvases() {
  return `const names={l0a:'A0',l0b:'B0',l0c:'C0',l1a:'F1',l1b:'G1',l1c:'H1',l1d:'W1',l2a:'A2',l2b:'B2',l2c:'C2',l2d:'I2',l2e:'P2',ov0:'H',ov1:'Y',ov2:'X',ov3:'A',ui0:'IDE',ui1:'MAIL',ui2:'KAN'};Object.keys(names).forEach(id=>lattice(id,names[id]));paintUi('ui0',['FILE','SRC','APP']);paintUi('ui1',['IN','MSG','VIEW']);paintUi('ui2',['TODO','DO','DONE']);paintOverflow('ov0','HIDE');paintOverflow('ov1','Y SCROLL');paintOverflow('ov2','X SCROLL');paintOverflow('ov3','AUTO');function paintOverflow(id,t){const c=document.getElementById(id),x=c.getContext('2d');x.fillStyle='#06101f';x.fillRect(0,0,c.width,c.height);x.strokeStyle='white';x.lineWidth=2;x.strokeRect(5,5,c.width-10,c.height-10);x.fillStyle='white';x.font='14px sans-serif';x.fillText(t,10,23)}function paintUi(id,labels){const c=document.getElementById(id),x=c.getContext('2d');x.fillStyle='#06101f';x.fillRect(0,0,c.width,c.height);labels.forEach((v,i)=>{x.fillStyle=['#f40070','#00d9ff','#ffe14a'][i];x.fillRect(7+i*32,22,28,26);x.fillStyle=i===1?'#06101f':'white';x.font='9px sans-serif';x.fillText(v,8+i*32,39)});x.strokeStyle='white';x.lineWidth=2;x.strokeRect(4,4,c.width-8,c.height-8);label(x,id.toUpperCase(),17)}`;
}

function paintWebgl() {
  return `const gl=document.getElementById('labgl').getContext('webgl');gl.viewport(0,0,260,132);gl.clearColor(.05,.02,.25,1);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-0.6,-0.6,0.7,-0.5,0.0,0.7]),gl.STATIC_DRAW);const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,2,2,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,0,0,255,0,255,255,255,255,255,0,255,255,0,255,255]));const vs=gl.createShader(gl.VERTEX_SHADER),fs=gl.createShader(gl.FRAGMENT_SHADER),pr=gl.createProgram();gl.shaderSource(vs,'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}');gl.shaderSource(fs,'precision mediump float;void main(){gl_FragColor=vec4(1.,.35,.85,1.);}');gl.compileShader(vs);gl.compileShader(fs);gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);gl.useProgram(pr);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);`;
}

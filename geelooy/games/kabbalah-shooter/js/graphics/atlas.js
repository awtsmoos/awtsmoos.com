//B"H
import { SPRITES } from '../config/sprites.js';
import { HEBREW_LETTERS } from '../data/hebrew.js';

export function createTextureAtlas(gl) {
  const size = 1024;
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = size;
  ctx.canvas.height = size;
  const cellSize = 128;
  const uvs = {};

  const drawCell = (index, drawFn) => {
    const col = index % 8;
    const row = Math.floor(index / 8);
    const x = col * cellSize;
    const y = row * cellSize;
    ctx.save();
    ctx.translate(x + cellSize/2, y + cellSize/2);
    drawFn(ctx, cellSize/2 - 10);
    ctx.restore();
    return { u0: x/size, v0: y/size, u1: (x+cellSize)/size, v1: (y+cellSize)/size };
  };

  // Standard Sprites
  uvs[SPRITES.PLAYER] = drawCell(0, (c, r) => {
    c.fillStyle = '#0ff'; c.beginPath(); c.arc(0,0, r*0.5, 0, Math.PI*2); c.fill();
    c.strokeStyle = '#fff'; c.lineWidth=4; c.stroke();
  });
  uvs[SPRITES.BULLET] = drawCell(1, (c, r) => { c.fillStyle='#fff'; c.beginPath(); c.ellipse(0,0,r*0.2,r*0.6,0,0,Math.PI*2); c.fill(); });
  uvs[SPRITES.HEXAGON] = drawCell(2, (c, r) => { c.strokeStyle='#fff'; c.lineWidth=5; c.beginPath(); for(let i=0;i<6;i++){ c.lineTo(Math.cos(i*Math.PI/3)*r, Math.sin(i*Math.PI/3)*r); } c.closePath(); c.stroke(); });
  uvs[SPRITES.CIRCLE] = drawCell(3, (c, r) => { c.strokeStyle='#fff'; c.lineWidth=5; c.beginPath(); c.arc(0,0,r,0,Math.PI*2); c.stroke(); });
  uvs[SPRITES.SNAKE_HEAD] = drawCell(4, (c, r) => { c.fillStyle='#f00'; c.fillRect(-r*0.8,-r,r*1.6,r*2); }); 
  uvs[SPRITES.PARTICLE] = drawCell(5, (c, r) => { c.fillStyle='#fff'; c.beginPath(); c.arc(0,0,r,0,Math.PI*2); c.fill(); });
  uvs[SPRITES.STAR] = drawCell(6, (c, r) => { c.fillStyle='#fff'; c.beginPath(); c.arc(0,0,r*0.2,0,Math.PI*2); c.fill(); });
  uvs[SPRITES.POWERUP_GENERIC] = drawCell(7, (c, r) => { c.fillStyle='#fff'; c.font='30px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText("?",0,0); });
  uvs[SPRITES.POWERUP_ORB] = drawCell(8, (c, r) => { c.strokeStyle='#0f0'; c.strokeRect(-r/2,-r/2,r,r); });
  uvs[SPRITES.POWERUP_SHIELD] = drawCell(9, (c, r) => { c.strokeStyle='#ff0'; c.beginPath(); c.arc(0,0,r/2,0,Math.PI*2); c.stroke(); });
  uvs[SPRITES.LETTER_PICKUP] = drawCell(10, (c, r) => { c.strokeStyle='#0ff'; c.strokeRect(-r/2,-r/2,r,r); });
  uvs[SPRITES.GRID_LINE] = drawCell(11, (c,r)=>{c.fillStyle='#333'; c.fillRect(-r,-2,r*2,4);});
  uvs[SPRITES.TOUCH_RING] = drawCell(12, (c,r)=>{c.strokeStyle='#0ff'; c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();});
  uvs[SPRITES.SHADOW_PLAYER] = drawCell(13, (c,r)=>{c.fillStyle='#500';c.beginPath(); c.arc(0,0,r*0.5,0,Math.PI*2); c.fill();});
  uvs[SPRITES.SEFIROT_ICON] = drawCell(14, (c,r)=>{c.strokeStyle='#fff'; c.strokeRect(-r/2,-r/2,r,r);});
  uvs[SPRITES.GRAVITY_WELL] = drawCell(15, (c,r)=>{c.strokeStyle='#f0f'; c.beginPath(); c.arc(0,0,r,0,Math.PI*2); c.stroke();});
  uvs[SPRITES.BEAM_CORE] = drawCell(16, (c,r)=>{c.fillStyle='#fff'; c.fillRect(-r,-5,r*2,10);});
  uvs[SPRITES.MERKABAH] = drawCell(17, (c,r)=>{c.strokeStyle='#f00'; c.beginPath(); c.moveTo(0,-r);c.lineTo(r,r);c.lineTo(-r,r);c.closePath();c.stroke();});
  uvs[SPRITES.PLATONIC_CUBE] = drawCell(18, (c,r)=>{c.strokeStyle='#0ff'; c.strokeRect(-r/2,-r/2,r,r);});
  uvs[SPRITES.PLATONIC_TETRA] = drawCell(19, (c,r)=>{c.strokeStyle='#f0f'; c.beginPath(); c.moveTo(0,-r);c.lineTo(r,r);c.lineTo(-r,r);c.closePath();c.stroke();});
  uvs[SPRITES.PLATONIC_OCTA] = drawCell(20, (c,r)=>{c.strokeStyle='#0f0'; c.beginPath(); c.moveTo(0,-r);c.lineTo(r,0);c.lineTo(0,r);c.lineTo(-r,0);c.closePath();c.stroke();});
  uvs[SPRITES.PLATONIC_DODECA] = drawCell(21, (c,r)=>{c.strokeStyle='#ff0'; c.beginPath(); c.arc(0,0,r,0,Math.PI*2); c.stroke();}); 
  uvs[SPRITES.PLATONIC_ICOSA] = drawCell(22, (c,r)=>{c.strokeStyle='#00f'; c.beginPath(); c.moveTo(0,-r);c.lineTo(r*0.8,r*0.5);c.lineTo(-r*0.8,r*0.5);c.closePath();c.stroke();});
  uvs[SPRITES.ANGEL] = drawCell(23, (c,r)=>{c.fillStyle='#fff'; c.beginPath(); c.arc(0,-r/2,r/3,0,Math.PI*2); c.fill(); c.moveTo(-r,0); c.lineTo(r,0); c.stroke();});
  uvs[SPRITES.PRISON_CELL] = drawCell(24, (c,r)=>{c.strokeStyle='#fff'; c.strokeRect(-r,-r,r*2,r*2); c.moveTo(0,-r); c.lineTo(0,r); c.moveTo(-r,0); c.lineTo(r,0); c.stroke();});
  uvs[SPRITES.CHASSID_ALLY] = drawCell(25, (c,r)=>{c.fillStyle='#fd0'; c.beginPath(); c.arc(0,0,r/2,0,Math.PI*2); c.fill();});
  uvs[SPRITES.MITZVAH_TANK] = drawCell(26, (c,r)=>{c.fillStyle='#ff0'; c.fillRect(-r,-r/2,r*2,r);});
  uvs[SPRITES.FLAG] = drawCell(27, (c,r)=>{c.fillStyle='#ff0'; c.beginPath(); c.moveTo(-r,-r); c.lineTo(r,-r); c.lineTo(r/2,0); c.lineTo(r,r); c.lineTo(-r,r); c.fill();});
  uvs[SPRITES.CANDLE] = drawCell(28, (c,r)=>{c.fillStyle='#fff'; c.fillRect(-r/4,0,r/2,r); c.fillStyle='#fa0'; c.beginPath(); c.arc(0,-r/4,r/4,0,Math.PI*2); c.fill();});
  uvs[SPRITES.MIKVAH_POOL] = drawCell(29, (c,r)=>{c.strokeStyle='#0af'; c.lineWidth=2; c.beginPath(); c.arc(0,0,r,0,Math.PI*2); c.stroke(); c.beginPath(); c.arc(0,0,r*0.7,0,Math.PI*2); c.stroke();});
  uvs[SPRITES.SHOFAR_WAVE] = drawCell(30, (c,r)=>{c.strokeStyle='#fa0'; c.beginPath(); c.arc(0,0,r,Math.PI, 0); c.stroke();});
  uvs[SPRITES.WELLSPRING_SOURCE] = drawCell(31, (c,r)=>{c.fillStyle='#0ff'; c.beginPath(); c.arc(0,0,r*0.6,0,Math.PI*2); c.fill(); c.strokeStyle='#fff'; c.stroke();});
  uvs[SPRITES.PRISM] = drawCell(32, (c,r)=>{c.fillStyle='#fff'; c.beginPath(); c.moveTo(0,-r); c.lineTo(r,r); c.lineTo(-r,r); c.fill();});
  uvs[SPRITES.LIGHT_RAY] = drawCell(33, (c,r)=>{c.fillStyle='#fff'; c.fillRect(-r*0.1,-r,r*0.2,r*2);});
  uvs[SPRITES.OHR_PARTICLE] = drawCell(34, (c,r)=>{c.fillStyle='#fff'; c.shadowBlur=10; c.shadowColor='#fff'; c.beginPath(); c.arc(0,0,r*0.4,0,Math.PI*2); c.fill();});

  uvs[SPRITES.COIN] = drawCell(35, (c,r)=>{c.fillStyle='#fd0'; c.beginPath(); c.arc(0,0,r*0.6,0,Math.PI*2); c.fill(); c.fillStyle='#b80'; c.fillText("A", -5, 5);});
  uvs[SPRITES.CROWN] = drawCell(36, (c,r)=>{c.strokeStyle='#fd0'; c.lineWidth=3; c.beginPath(); c.moveTo(-r*0.6,0); c.lineTo(-r*0.6,-r*0.6); c.lineTo(-r*0.2,-r*0.2); c.lineTo(0,-r*0.8); c.lineTo(r*0.2,-r*0.2); c.lineTo(r*0.6,-r*0.6); c.lineTo(r*0.6,0); c.closePath(); c.stroke();});
  uvs[SPRITES.ANCHOR] = drawCell(37, (c,r)=>{c.strokeStyle='#88f'; c.lineWidth=4; c.beginPath(); c.moveTo(0,-r*0.6); c.lineTo(0,r*0.6); c.moveTo(-r*0.4,r*0.4); c.quadraticCurveTo(0,r,r*0.4,r*0.4); c.stroke();});
  uvs[SPRITES.STONE_TABLET] = drawCell(38, (c,r)=>{c.fillStyle='#888'; c.fillRect(-r*0.6,-r*0.8,r*1.2,r*1.6); c.fillStyle='#fff'; c.fillRect(-r*0.2,-r*0.4,r*0.4,r*0.1);});
  uvs[SPRITES.WATER_RIPPLE] = drawCell(39, (c,r)=>{c.strokeStyle='#0ff'; c.lineWidth=2; c.beginPath(); c.arc(0,0,r*0.8,0,Math.PI*2); c.stroke();});
  uvs[SPRITES.SEAL] = drawCell(40, (c,r)=>{c.strokeStyle='#f00'; c.beginPath(); c.arc(0,0,r*0.7,0,Math.PI*2); c.stroke(); c.fillText("EMET", -15, 5);});
  uvs[SPRITES.SCROLL_FRAGMENT] = drawCell(41, (c,r)=>{c.fillStyle='#fd0'; c.fillRect(-r*0.3,-r*0.6,r*0.6,r*1.2);});

  // NEW ENEMIES
  uvs[SPRITES.TURRET] = drawCell(42, (c,r)=>{
      c.strokeStyle='#f80'; c.lineWidth=4; 
      c.beginPath(); 
      for(let i=0;i<6;i++) c.lineTo(Math.cos(i*Math.PI/3)*r*0.8, Math.sin(i*Math.PI/3)*r*0.8); 
      c.closePath(); c.stroke();
      c.fillStyle='#f00'; c.beginPath(); c.arc(0,0,r*0.3,0,Math.PI*2); c.fill();
  });
  
  uvs[SPRITES.SWARMER] = drawCell(43, (c,r)=>{
      c.fillStyle='#f0f'; 
      c.beginPath(); c.moveTo(0,-r*0.8); c.lineTo(r*0.5, r*0.5); c.lineTo(0, r*0.3); c.lineTo(-r*0.5, r*0.5); c.fill();
  });

  uvs[SPRITES.SERAPH] = drawCell(44, (c,r)=>{
      c.strokeStyle='#ff0'; c.lineWidth=3;
      c.beginPath(); c.moveTo(0,-r); c.lineTo(r*0.8, -r*0.2); c.lineTo(0, r); c.lineTo(-r*0.8, -r*0.2); c.closePath(); c.stroke();
      c.beginPath(); c.arc(0,-r*0.2,r*0.3,0,Math.PI*2); c.stroke();
  });

  uvs[SPRITES.ENEMY_BULLET] = drawCell(45, (c,r)=>{
      c.fillStyle='#f55'; c.beginPath(); c.arc(0,0,r*0.4,0,Math.PI*2); c.fill();
      c.strokeStyle='#fff'; c.lineWidth=2; c.stroke();
  });
  
  // TACHLIT CHOCHMAH
  uvs[SPRITES.SCROLL_TORAH] = drawCell(46, (c,r)=>{
      c.fillStyle='#eec'; c.fillRect(-r*0.5,-r*0.8,r,r*1.6);
      c.fillStyle='#b84'; c.fillRect(-r*0.6,-r*0.9,r*0.2,r*1.8); c.fillRect(r*0.4,-r*0.9,r*0.2,r*1.8);
  });
  uvs[SPRITES.HAND_DEED] = drawCell(47, (c,r)=>{
      c.fillStyle='#faa'; c.beginPath(); c.arc(0,0,r*0.6,0,Math.PI*2); c.fill();
      c.fillStyle='#fff'; c.fillText("YAD", -10, 5);
  });
  uvs[SPRITES.HEART_FLAME] = drawCell(48, (c,r)=>{
      c.fillStyle='#f05'; c.beginPath(); c.moveTo(0,r*0.5); 
      c.bezierCurveTo(-r, -r*0.5, -r*0.5, -r, 0, -r*0.3);
      c.bezierCurveTo(r*0.5, -r, r, -r*0.5, 0, r*0.5); c.fill();
      c.fillStyle='#ff0'; c.beginPath(); c.arc(0,-r*0.3,r*0.2,0,Math.PI*2); c.fill();
  });
  uvs[SPRITES.MESSENGER_ANGEL] = drawCell(49, (c,r)=>{
      c.strokeStyle='#0ff'; c.beginPath(); c.moveTo(-r,0); c.lineTo(r,0); c.lineTo(0,-r); c.closePath(); c.stroke();
      c.beginPath(); c.arc(0,-r/2,r/4,0,Math.PI*2); c.stroke();
  });

  // Letters
  HEBREW_LETTERS.forEach((char, i) => {
      uvs[50 + i] = drawCell(50 + i, (c, r) => {
          c.fillStyle = '#fff';
          c.font = 'bold 80px Courier New';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText(char, 0, 0);
      });
  });

  return { texture: ctx.canvas, uvs };
}

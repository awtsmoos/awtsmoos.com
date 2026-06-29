// B"H
const TABLE=new Float32Array(65536);for(let i=0;i<65536;i++){const s=(i&0x8000)?-1:1,e=(i>>10)&31,f=i&1023;TABLE[i]=e===0?s*Math.pow(2,-14)*(f/1024):e===31?(f?NaN:s*Infinity):s*Math.pow(2,e-15)*(1+f/1024);}function f16(u8,off){return TABLE[u8[off]|(u8[off+1]<<8)];}module.exports={TABLE,f16};

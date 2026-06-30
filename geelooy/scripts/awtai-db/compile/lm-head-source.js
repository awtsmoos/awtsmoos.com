// B"H

/**
 * Source generation is a sealed niggun: no model text enters code, only numbers
 * already validated by lm-head-plan.  The generated scanner is Q6_K only and
 * keeps the hottest math inline so the loop does not pay helper-call tax.
 */
function buildLmHeadSource(plan) {
  const p = JSON.stringify;
  return `// B"H\n// Generated AWTAI JS LM-head scanner ${plan.key}\n` +
`const fs=require('fs');\nconst {TABLE}=require(${p(plan.f16Path)});\n` +
`const ROWS=${plan.rows},COLS=${plan.cols},STRIDE=${plan.stride},KEY=${p(plan.key)};\n` +
`function f16(b,o){return TABLE[b[o]|(b[o+1]<<8)];}\n` +
`function scan(filePath,off,input,k,opt={}){\n` +
` const limit=Math.min(ROWS,Math.max(0,opt.maxRows||ROWS));\n` +
` const wr=Math.max(1,Math.min(limit,opt.windowRows||128));\n` +
` const ids=new Int32Array(k),vals=new Float64Array(k); vals.fill(-Infinity);\n` +
` let used=0,readBytes=0; const fd=fs.openSync(filePath,'r'); const buf=Buffer.allocUnsafe(wr*STRIDE);\n` +
` try{for(let s=0;s<limit;s+=wr){const c=Math.min(wr,limit-s),n=c*STRIDE; readFull(fd,buf,n,off+s*STRIDE); readBytes+=n; for(let r=0;r<c;r++){const v=dotQ6(buf,r*STRIDE,input); used=ins(ids,vals,used,k,s+r,v);}}}\n` +
` finally{fs.closeSync(fd);}\n` +
` const top=[]; for(let i=0;i<used;i++)top.push({id:ids[i],logit:vals[i]}); return {top,readBytes,key:KEY,rows:limit,stride:STRIDE};}\n` +
`function readFull(fd,b,n,pos){let got=0; while(got<n){const r=fs.readSync(fd,b,got,n-got,pos+got); if(r<=0)throw new Error("B'H short LM-head read"); got+=r;}}\n` +
`function ins(ids,vals,used,k,id,v){if(!Number.isFinite(v))return used; let i=0; while(i<used&&vals[i]>=v)i++; if(i>=k)return used; const end=Math.min(used,k-1); for(let j=end;j>i;j--){ids[j]=ids[j-1]; vals[j]=vals[j-1];} ids[i]=id; vals[i]=v; return used<k?used+1:used;}\n` +
`function dotQ6(b,o,x){let sum=0; for(let base=0,p=o;base<COLS;base+=256,p+=210){let ql=p,qh=p+128,sc=p+192; const d=f16(b,p+208); for(let half=0,y=base;half<2;half++,y+=128,ql+=64,qh+=32,sc+=8){for(let l=0;l<32;l++){const a=b[ql+l],c=b[ql+32+l],h=b[qh+l],is=l>>4; const s0=b[sc+is],s1=b[sc+is+2],s2=b[sc+is+4],s3=b[sc+is+6]; sum+=d*(s0>127?s0-256:s0)*(((a&15)|(((h>>0)&3)<<4))-32)*x[y+l]; sum+=d*(s1>127?s1-256:s1)*(((c&15)|(((h>>2)&3)<<4))-32)*x[y+l+32]; sum+=d*(s2>127?s2-256:s2)*(((a>>4)|(((h>>4)&3)<<4))-32)*x[y+l+64]; sum+=d*(s3>127?s3-256:s3)*(((c>>4)|(((h>>6)&3)<<4))-32)*x[y+l+96];}}} return sum;}\n` +
`module.exports={scan,meta:{key:KEY,rows:ROWS,cols:COLS,stride:STRIDE,type:14}};\n`;
}

module.exports = { buildLmHeadSource };

// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos measures served bytes without unbounded browser response buffering. */
async function browserFetch(url,digest){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
 try{
  const response=await fetch(url,{cache:"no-store",signal:controller.signal});
  if(!response.ok||!response.body)return null;
  const limit=digest?5*1024*1024:65536,reader=response.body.getReader(),chunks=[];let total=0;
  while(true){const r=await reader.read();if(r.done)break;total+=r.value.byteLength;
   if(total>limit){await reader.cancel();return null;}chunks.push(r.value);}
  const bytes=new Uint8Array(total);let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  if(!digest)return JSON.parse(new TextDecoder().decode(bytes));
  const hash=await crypto.subtle.digest("SHA-256",bytes);
  return Array.from(new Uint8Array(hash)).map(x=>x.toString(16).padStart(2,"0")).join("");
 }catch{return null;}finally{clearTimeout(timer);}
}
module.exports={browserFetch};

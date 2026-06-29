// B"H
class RunStats{constructor(){this.readBytes=0;this.dequantBytes=0;this.tensorsRead=0;this.layers=0;this.events=[];}event(name,data={}){this.events.push({at:Date.now(),name,...data});}read(n,name){this.readBytes+=n;this.tensorsRead++;this.event('read',{name,bytes:n});}dequant(n,name){this.dequantBytes+=n;this.event('dequant',{name,bytes:n});}summary(){return{readBytes:this.readBytes,dequantBytes:this.dequantBytes,tensorsRead:this.tensorsRead,layers:this.layers,events:this.events.slice(-20)};}}
module.exports={RunStats};

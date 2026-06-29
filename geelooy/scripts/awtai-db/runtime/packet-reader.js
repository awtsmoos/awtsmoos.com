// B"H
class PacketReader{constructor(awtaiFile,index){this.file=awtaiFile;this.index=index;}readPacket(packet){return packet.tensors.map(id=>{const t=this.index.id(id);return{tensor:t,bytes:this.file.tensorBytes(t)};});}}
module.exports={PacketReader};

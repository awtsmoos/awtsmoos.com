// B"H
class Session{constructor(prompt){this.prompt=prompt;this.tokens=[];this.position=0;this.kvPages=[];this.log=[];}record(x){this.log.push({at:new Date().toISOString(),...x});}}
module.exports={Session};

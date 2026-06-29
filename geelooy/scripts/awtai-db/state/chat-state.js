// B"H
class ChatState{constructor(tokens){this.tokens=tokens;this.generated=[];this.position=0;}append(id){this.generated.push(id);this.tokens.push(id);this.position=this.tokens.length-1;}}module.exports={ChatState};

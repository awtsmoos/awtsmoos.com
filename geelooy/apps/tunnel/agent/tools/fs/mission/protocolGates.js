// B"H
const CHOICES=[
  {key:'A',text:'Continue to next required stage',action:'next_stage'},
  {key:'B',text:'Redo current stage deeper',action:'redo_stage'},
  {key:'C',text:'Add more ideas before narrowing',action:'more_ideas'},
  {key:'D',text:'Inspect more files before planning',action:'inspect_more'},
  {key:'E',text:'Record blocker and continue through queue',action:'queue_blocker'}
];
function gate(protocol,cycle,stage){return {id:`protocol_gate_${protocol.currentCycle}_${stage}`,stage,answerMode:'single_letter_choice',strictAnswer:true,expectedAnswerFormat:'ONE EXACT LETTER: A, B, C, D, or E. No prose.',choices:CHOICES,prompt:`Boss protocol gate after ${stage}`,recommendedAnswer:'A'};}
function parse(answer){const raw=String(answer||'').trim();const key=/^[A-E]$/i.test(raw)?raw.toUpperCase():'';return {raw,key,choice:CHOICES.find(c=>c.key===key)||null,ok:!!key};}
module.exports={CHOICES,gate,parse};

// B"H
function review(input={}){return {planned:list(input.planned),done:list(input.done),missing:list(input.missing),newDebt:list(input.newDebt),proof:list(input.proof||input.tests),nextRequiredStage:input.nextRequiredStage||'',at:new Date().toISOString()};}
function list(v){if(Array.isArray(v))return v.map(String).filter(Boolean);if(typeof v==='string'&&v.trim())return v.split(/\n|,/).map(x=>x.trim()).filter(Boolean);return[];}
function markdown(r){return ['# Done vs Planned','## Planned',...bullets(r.planned),'## Done',...bullets(r.done),'## Missing',...bullets(r.missing),'## New Debt',...bullets(r.newDebt),'## Proof',...bullets(r.proof),`## Next Required Stage\n${r.nextRequiredStage||'NEXT_GATE'}`].join('\n');}
function bullets(items){return items.length?items.map(x=>`- ${x}`):['- none'];}
module.exports={review,markdown};

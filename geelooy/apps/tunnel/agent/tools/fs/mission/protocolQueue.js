// B"H
function ideasFromText(text){return String(text||'').split(/\n/).map(x=>x.replace(/^[-*\d.\s]+/,'').trim()).filter(Boolean);}
function rankIdeas(ideas){return ideas.map((title,i)=>({id:`protocol_idea_${i+1}`,title,severity:i<5?'P1':i<20?'P2':'P3',family:family(title),required:i<5,status:'open'}));}
function family(title){const t=String(title).toLowerCase();if(/test|proof|suite/.test(t))return'tests';if(/security|secret|auth/.test(t))return'security';if(/observe|log|metric/.test(t))return'observability';if(/doc|readme/.test(t))return'docs';if(/refactor|split|module/.test(t))return'architecture';return'innovation';}
function feed(m,env,text){const ranked=rankIdeas(ideasFromText(text));for(const item of ranked.slice(0,12))env.ContinuationQueue.add(m,item);return ranked;}
module.exports={ideasFromText,rankIdeas,feed};

// B"H
const assert = require('assert');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
function findPublicRoot(start){let dir=start;while(dir&&dir!==path.dirname(dir)){if(fs.existsSync(path.join(dir,'apps/tunnel/agent/main.js'))) return dir;dir=path.dirname(dir);}throw new Error('root');}
const repoRoot=path.resolve('geelooy');
const fsRoot=path.join(__dirname,'.tmp-puppeteer-diagnostic');
const { buildActions }=require(path.join(repoRoot,'apps/tunnel/agent/tools/fs/actions.js'));
function config(){return {root:fsRoot,allowWrite:true,allowSecrets:false,tools:{fsRead:true,fsWrite:true,fsBulk:true,fsList:true,fsTree:true}};}
async function runFs(action,payload={}){const actions=buildActions(config(),{action,...payload},null);return await actions[action]();}
function html(){return `<body><input id="name"><input id="flag" type="checkbox"><select id="kind"><option value="a">A</option><option value="b">B</option></select><button id="go">Go</button><button id="dbl">Dbl</button><div id="out">empty</div><script>
window.events=[]; const by=id=>document.getElementById(id); const log=x=>window.events.push(x);
by('name').addEventListener('input', e => { window.typed=e.target.value; log('input:'+e.target.value); });
by('flag').addEventListener('change', e => { window.flag=e.target.checked; log('flag:'+e.target.checked); });
by('kind').addEventListener('change', e => { window.kind=e.target.value; log('kind:'+e.target.value); });
by('go').addEventListener('click', () => { by('out').textContent='Hello '+by('name').value+' '+by('kind').value+' '+by('flag').checked; window.clicked=true; });
by('dbl').addEventListener('click', () => { window.dbl=(window.dbl||0)+1; by('out').textContent='dbl '+window.dbl; });
</script></body>`;}
(async()=>{
 await fsp.rm(fsRoot,{recursive:true,force:true}); await fsp.mkdir(fsRoot,{recursive:true});
 const browserActions=[
  {action:'goto',url:'http://local.test/page'}, {action:'assertUrl',expected:'local.test/page'}, {action:'waitForSelector',selector:'#name',timeoutMs:30},
  {action:'fill',selector:'#name',value:'Dovid'}, {action:'assertValue',selector:'#name',expected:'Dovid'}, {action:'clear',selector:'#name'},
  {action:'type',selector:'#name',text:'Melech'}, {action:'check',selector:'#flag'}, {action:'assertChecked',selector:'#flag',expected:true},
  {action:'selectOption',selector:'#kind',value:'b'}, {action:'hover',selector:'#go'}, {action:'focus',selector:'#name'}, {action:'blur',selector:'#name'},
  {action:'click',selector:'#go'}, {action:'assertText',selector:'#out',expected:'Hello Melech b true'}, {action:'doubleClick',selector:'#dbl'},
  {action:'evaluate',source:'({ dbl: window.dbl, out: document.querySelector(`#out`).textContent, events: window.events })'},
  {action:'waitForFunction',source:'window.dbl === 2',timeoutMs:15,continueOnError:true},
  {action:'evaluate',source:'({ out: document.querySelector(`#out`).textContent, dbl: window.dbl, typed: window.typed })'}, {action:'snapshot'}
 ];
 const sim=await runFs('simulateRuntime',{runtime:'browser',engine:'merkava',entry:'index.html',html:html(),browserActions,returnValues:['window.dbl','window.events','window.clicked']});
 fs.writeFileSync('AI_THOUGHTS/runtime-stress/puppeteer-diagnostic.json',JSON.stringify(sim,null,2));
 console.log(JSON.stringify({ok:sim.ok, errors:sim.errors||sim.result?.errors||[], log:sim.interactionLog.map(x=>({action:x.action, ok:x.ok, value:x.value, error:x.error}))},null,2));
})();

// B"H
const fs = require("fs");
const path = require("path");
const http = require("http");
const { dispatchOsFs } = require("../../geelooy/api/tunnel/control/routes/osFs/index.js");
const { supportAction } = require("../../geelooy/api/tunnel/control/routes/osFs/supportActions.js");
const outDir = __dirname;
const reportPath = path.join(outDir, "virtual-os-poll-correction-results.json");
const userId = "pollUser_" + Date.now();
function makeDb() { const map = new Map([[`/users/${userId}/aliases/machine`, { aliasId: "machine" }]]); return { async get(p){return map.get(p);}, async read(p){return map.get(p);}, async write(p,v={}){map.set(p,v);return {ok:true,path:p};}, async delete(p){const had=map.delete(p);return {ok:true,deleted:had,path:p};} }; }
const $i = { db: makeDb(), ws: { clients: [] } };
function dispatch(payload) { return dispatchOsFs($i, userId, { ...payload, tunnelName:"awtsmoos-virtual-os", targetVessel:"virtual-os" }); }
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function httpGet(pathname){return new Promise(resolve=>{const req=http.request({hostname:"127.0.0.1",port:8080,path:pathname,timeout:8000},res=>{let body="";res.setEncoding("utf8");res.on("data",c=>body+=c);res.on("end",()=>resolve({ok:true,status:res.statusCode,hasButton:/button/i.test(body),bytes:body.length,title:(body.match(/<title>(.*?)<\/title>/i)||[])[1]||""}));});req.on("error",e=>resolve({ok:false,error:e.message}));req.end();});}
async function run(){
  await dispatch({action:"write",path:"machine/package.json",content:JSON.stringify({name:"vos-poll-app",version:"1.0.0"},null,2),confirm:true,dryRun:false});
  await dispatch({action:"write",path:"machine/data.json",content:JSON.stringify({BH:"B'H",ok:true},null,2),confirm:true,dryRun:false});
  const jsonValidate=await dispatch({action:"jsonValidate",path:"machine/data.json"});
  const packageInfo=await dispatch({action:"packageInfo",path:"machine/package.json"});
  const spawn=await supportAction("aiAgentSpawnTask",{action:"aiAgentSpawnTask",provider:"minimax",agentId:"minimax-deep",model:"MiniMax-M2.7",path:"machine/data.json",message:"Reply with exactly POLL_TASK_OK and no other words.",stream:false,outputDir:"machine/out",fileName:"task.md"},dispatch);
  let status=null, result=null;
  for(let i=0;i<12;i++){ await sleep(i ? 2500 : 500); status=await supportAction("aiAgentTaskStatus",{taskId:spawn.taskId},dispatch); result=await supportAction("aiAgentTaskResult",{taskId:spawn.taskId},dispatch); if(result.ok || status.task?.status === "failed") break; }
  const outRead=await dispatch({action:"read",path:"machine/out/task.md",maxChars:2000});
  const publicApp=await httpGet("/apps/virtual-os-stress-light-counter/");
  const checks={jsonValidateOk:jsonValidate.valid===true,packageInfoOk:packageInfo.ok!==false,spawnOk:spawn.ok===true,statusComplete:status.task?.status==="complete",resultOk:result.ok===true,outputHasText:String(outRead.content||"").length>0,publicAppOk:publicApp.status===200&&publicApp.hasButton};
  const report={ok:Object.values(checks).every(Boolean),generatedAt:new Date().toISOString(),userId,publicUrl:"http://localhost:8080/apps/virtual-os-stress-light-counter/",checks,jsonValidate,packageInfo,spawn,status,result,outRead:{ok:outRead.ok,content:String(outRead.content||"").slice(0,500)},publicApp};
  fs.writeFileSync(reportPath,JSON.stringify(report,null,2));
  fs.writeFileSync(path.join(outDir,"virtual-os-poll-correction-report.md"),[`B"H`,`# Virtual OS poll correction`,`OK: ${report.ok}`,`Public app: ${report.publicUrl}`,"```json",JSON.stringify({checks,publicApp,result:{ok:result.ok,status:result.status,text:String(result.output?.text||"").slice(0,120)}},null,2),"```"].join("\n"));
  console.log(JSON.stringify({ok:report.ok,reportPath,publicUrl:report.publicUrl,checks,publicApp},null,2));
}
run().catch(e=>{console.error(e.stack||e);process.exit(1);});

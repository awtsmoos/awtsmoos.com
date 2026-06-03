// B"H
const fs = require("fs");
const path = require("path");
const http = require("http");
const { dispatchOsFs } = require("../../geelooy/api/tunnel/control/routes/osFs/index.js");
const { supportAction } = require("../../geelooy/api/tunnel/control/routes/osFs/supportActions.js");

const outDir = __dirname;
const reportPath = path.join(outDir, "virtual-os-correction-stress-results.json");
const mdPath = path.join(outDir, "virtual-os-correction-stress-report.md");
const userId = "correctionUser_" + Date.now();

/**
 * B"H
 * Chapter 385: The Four False Failures Were Given Their True Vessels.
 *
 * The first full stress found four red sparks caused by bad test inputs. This
 * pass creates proper JSON/package files, spawns a real Virtual OS MiniMax task
 * to get a taskId, checks status/result, and hits the local public app URL.
 */
function makeDb() {
  const map = new Map([[`/users/${userId}/aliases/machine`, { aliasId: "machine" }]]);
  return { async get(p){return map.get(p);}, async read(p){return map.get(p);}, async write(p,v={}){map.set(p,v);return {ok:true,path:p};}, async delete(p){const had=map.delete(p);return {ok:true,deleted:had,path:p};}, dump(){return Object.fromEntries(map);} };
}
const $i = { db: makeDb(), ws: { clients: [] } };
function dispatch(payload) { return dispatchOsFs($i, userId, { ...payload, tunnelName: "awtsmoos-virtual-os", targetVessel: "virtual-os" }); }
function httpGet(pathname) { return new Promise(resolve => { const req = http.request({ hostname:"127.0.0.1", port:8080, path:pathname, timeout:8000 }, res => { let body=""; res.setEncoding("utf8"); res.on("data", c => body += c); res.on("end", () => resolve({ ok:true, status:res.statusCode, hasButton:/<button|button/i.test(body), bytes:body.length, title:(body.match(/<title>(.*?)<\/title>/i)||[])[1]||"" })); }); req.on("error", e => resolve({ ok:false, error:e.message })); req.end(); }); }
async function run() {
  await dispatch({ action:"write", path:"machine/package.json", content: JSON.stringify({ name:"vos-correction-app", version:"1.0.0", scripts:{ start:"node index.js" }}, null, 2), confirm:true, dryRun:false });
  await dispatch({ action:"write", path:"machine/data.json", content: JSON.stringify({ BH:"B'H", count:7, app:"Light Counter" }, null, 2), confirm:true, dryRun:false });
  const jsonValidate = await dispatch({ action:"jsonValidate", path:"machine/data.json" });
  const packageInfo = await dispatch({ action:"packageInfo", path:"machine/package.json" });
  const spawn = await supportAction("aiAgentSpawnTask", { action:"aiAgentSpawnTask", provider:"minimax", agentId:"minimax-deep", model:"MiniMax-M2.7", path:"machine/data.json", message:"Reply with exactly CORRECTION_TASK_OK and no other words.", stream:false, outputDir:"machine/out", fileName:"task.md" }, dispatch);
  await new Promise(r => setTimeout(r, 1500));
  const status = await supportAction("aiAgentTaskStatus", { taskId: spawn.taskId }, dispatch);
  const result = await supportAction("aiAgentTaskResult", { taskId: spawn.taskId }, dispatch);
  const outRead = await dispatch({ action:"read", path:"machine/out/task.md", maxChars:2000 });
  const publicApp = await httpGet("/apps/virtual-os-stress-light-counter/");
  const checks = { jsonValidateOk: jsonValidate.ok !== false && jsonValidate.valid !== false, packageInfoOk: packageInfo.ok !== false, spawnOk: spawn.ok === true, statusOk: status.ok === true, resultOk: result.ok === true, outputReadOk: outRead.ok !== false, publicAppOk: publicApp.status === 200 && publicApp.hasButton };
  const report = { ok: Object.values(checks).every(Boolean), generatedAt:new Date().toISOString(), userId, checks, publicUrl:"http://localhost:8080/apps/virtual-os-stress-light-counter/", jsonValidate, packageInfo, spawn, statusSummary: { ok: status.ok, taskStatus: status.task && status.task.status, events: status.task && status.task.events }, resultSummary: { ok: result.ok, status: result.status, text: String(result.output && result.output.text || "").slice(0, 200), error: result.error || null }, outRead: { ok: outRead.ok, content: String(outRead.content || "").slice(0, 200) }, publicApp };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(mdPath, [`B"H`, `# Virtual OS correction stress`, ``, `OK: ${report.ok}`, `Public app: ${report.publicUrl}`, ``, "```json", JSON.stringify({ checks, publicApp, result: report.resultSummary }, null, 2), "```"].join("\n"));
  console.log(JSON.stringify({ ok: report.ok, reportPath, mdPath, publicUrl: report.publicUrl, checks, publicApp }, null, 2));
}
run().catch(e => { console.error(e.stack || e); process.exit(1); });

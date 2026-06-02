//B"H
const fs=require("fs"),path=require("path");
const {ROOT,assert,test}=require("./assert.cjs");
const {renderControlPage}=require("../../relay/split-browser/controlPage.cjs");

/** B"H: installer, background owner, and no-debug control login guard. */
async function run(){return test("relay-install-and-no-debug-control",async()=>{
  const sh=read("relay/install/install-awtsmoos-chatgpt-relay.sh");
  const ps1=read("relay/install/install-awtsmoos-chatgpt-relay.ps1");
  const panel=read("js/automation/panelMarkup.js");
  const bridge=read("js/automation/backgroundBridge.js");
  const automation=read("relay/split-browser/automation.cjs");
  const html=renderControlPage({port:38488,targetOrigin:"https://chatgpt.com"});
  const files=fs.readdirSync(path.join(ROOT,"relay/split-browser")).filter(n=>/\.(cjs|js)$/.test(n)&&!n.startsWith(".smoke"));
  const missingSh=files.filter(n=>!sh.includes(n));
  const missingPs1=files.filter(n=>!ps1.includes(n));
  assert(missingSh.length===0,"Unix installer must download every split-browser module",{missingSh});
  assert(missingPs1.length===0,"PowerShell installer must download every split-browser module",{missingPs1});
  assert(/pkg install -y nodejs/.test(sh),"Unix installer must support Termux pkg fallback");
  assert(/nohup node index\.js/.test(sh)&&/relay\.pid/.test(sh)&&/health_ok/.test(sh),"Unix installer must detach and wait for health");
  assert(/Start-Process[\s\S]*cmd\.exe/.test(ps1)&&/relay\.pid/.test(ps1)&&/Test-RelayHealth/.test(ps1),"PowerShell installer must detach and wait for health");
  assert(/does not require debug Chrome/.test(sh+ps1),"installers must mention no-debug control login");
  assert(/Open ChatGPT through Node — no debug Chrome needed/.test(html),"control page must put no-debug login first");
  assert(html.indexOf("/chatgpt")<html.indexOf("Optional debug Chrome"),"proxy login must appear before optional debug controls");
  assert(/debug Chrome optional|Debug Chrome is optional/i.test(html),"control page must label debug Chrome optional");
  assert(/data-auto="backgroundOwned"/.test(panel),"automation UI must expose background owner switch");
  assert(/settings\.backgroundOwned === true/.test(bridge),"bridge must honor backgroundOwned flag");
  assert(/chatgptModePayload/.test(automation)&&/hasModePayload/.test(automation),"relay automation must carry ChatGPT mode payload");
  return {files:files.length,installersDownloadAll:true,noDebugControl:true,backgroundSwitch:true,modePayload:true};
});}
function read(file){return fs.readFileSync(path.join(ROOT,file),"utf8");}
module.exports={run};

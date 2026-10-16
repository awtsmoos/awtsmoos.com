// B"H
const assert=require("node:assert/strict");
const test=require("node:test");
const {parse}=require("./agent-command-policy.js");
test("simple native default is a strict non-shell diagnostic allowlist",()=>{
  for(const command of ["pwd","whoami","uname -a","git --version","git status --short","node --version","npm -v","echo SUCCESS_123"]) {
    const x=parse(command);assert.equal(x.nativeShell,false,command);assert.equal(x.profile,"safe");
  }
  for(const command of ["sudo whoami","cat ~/.ssh/id_rsa","git push origin main","rm -rf /","echo $(id)","pwd; uname -a","ls | head","node -e process.exit()","curl http://169.254.169.254","git status && whoami"]) {
    assert.throws(()=>parse(command),/simple_tunnel_command_policy_denied/,command);
  }
});

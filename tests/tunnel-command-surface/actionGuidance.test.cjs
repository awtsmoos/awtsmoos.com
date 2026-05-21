// B"H
const assert = require("assert");
const { attachActionGuidance } = require("../../geelooy/API/tunnel/control/core/actionGuidance.js");
const { dispatchOsFs } = require("../../geelooy/API/tunnel/control/routes/osFs/index.js");

async function main() {
  const guided = attachActionGuidance({ ok: true, action: "list" }, { action: "list" });
  assert.equal(guided.aiGuidance.keepGoing, true);
  assert.match(guided.aiGuidance.keepGoingPrompt, /Keep going/);
  assert.ok(Array.isArray(guided.aiGuidance.prompts));
  assert.ok(guided.aiGuidance.prompts.length >= 5);
  assert.match(guided.aiGuidance.prompts.join("\n"), /Keep going|continue|inspect|verify/i);
  assert.match(guided.aiGuidance.remainingWorkPrompt, /remaining things/i);
  assert.match(guided.aiGuidance.confusingActionPrompt, /confusing action/i);
  assert.match(guided.aiGuidance.concludePrompt, /finishAndContinue|conclude/i);

  const finish = await dispatchOsFs(null, "test", { action: "finishAndContinue" });
  assert.equal(finish.ok, true);
  assert.equal(finish.finalInstruction.role, "assistant");
  assert.match(finish.finalInstruction.content, /Keep going/);
  assert.match(finish.finalInstruction.content, /remaining things/i);
  assert.match(finish.finalInstruction.content, /finishAndContinue|conclude/i);

  console.log("B'H action guidance and finishAndContinue prompts ok");
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});

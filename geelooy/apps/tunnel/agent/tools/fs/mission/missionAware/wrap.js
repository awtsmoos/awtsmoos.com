// B"H
const Receipt = require('./receipt.js');
function wrapActions(actions, config, payload = {}) {
  if (!Receipt.missionId(payload, config) || !Receipt.autoEnabled(payload, config)) return actions;
  const wrapped = {};
  for (const [name, fn] of Object.entries(actions)) wrapped[name] = typeof fn === 'function' ? async () => run(config, payload, name, fn) : fn;
  return wrapped;
}
async function run(config, payload, name, fn) {
  try { return await decorate(config, payload, name, await fn()); }
  catch (error) { const result = { ok:false, action:name, error:error.message, stack:error.stack }; const decorated = await decorate(config, payload, name, result).catch(() => result); throw Object.assign(error, { missionAwareResult:decorated }); }
}
async function decorate(config, payload, name, result) {
  const auto = await Receipt.attach(config, payload, name, result).catch(error => ({ ok:false, error:error.message }));
  if (!auto) return result;
  return { ...result, missionAutoReceipt:auto.receipt || null, missionId:auto.missionId, missionInstruction:auto.prompt?.instruction || '', missionPrompt:auto.prompt || null, missionAutoError:auto.ok === false ? auto.error : undefined };
}
/** B"H: The active mission can now ride from config even when payload forgets its name. */
module.exports = { wrapActions };

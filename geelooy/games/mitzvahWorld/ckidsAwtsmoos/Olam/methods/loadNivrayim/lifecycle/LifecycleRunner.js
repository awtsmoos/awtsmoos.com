// B"H
/** LifecycleRunner.js — bounded batch runner for heescheel/ready/afterBriyah. */
import { describeNivra } from "./LifecycleDescribe.js?v=mitzvah-lifecycle-split-20260703-bh1";
import { labelOf, mark } from "./LifecycleProgress.js?v=mitzvah-lifecycle-split-20260703-bh1";
import { LifecycleTimeoutError, withTimeout } from "./LifecycleTimeout.js?v=mitzvah-lifecycle-split-20260703-bh1";

const PHASE_TIMEOUTS = { heescheel:25000, ready:7000, afterBriyah:5000, madeAll:5000 };
async function runOne(ctx, nivra, phase, args, label) {
  const fn = nivra?.[phase]; if (typeof fn !== "function") return false;
  try { await withTimeout(fn.apply(nivra, args), PHASE_TIMEOUTS[phase] || 6000, label, phase); return true; }
  catch (error) {
    mark(`${phase}:item:${error instanceof LifecycleTimeoutError ? "timeout" : "error"}`, { label, message:error?.message || String(error) });
    console.warn(`B"H - lifecycle ${phase} skipped stuck vessel ${label}`, describeNivra(nivra, error));
    return false;
  }
}
export async function runPhase(ctx, phase, nivrayimMade, argsFactory) {
  const total = nivrayimMade.length; mark(`${phase}:batch:start`, { label:`count=${total}` });
  for (let i = 0; i < total; i += 1) {
    const nivra = nivrayimMade[i], label = labelOf(nivra, i, total);
    mark(`${phase}:item:start`, { label });
    await runOne(ctx, nivra, phase, argsFactory ? argsFactory(nivra) : [ctx], label);
    mark(`${phase}:item:done`, { label });
  }
  mark(`${phase}:batch:done`, { label:`count=${total}` });
}

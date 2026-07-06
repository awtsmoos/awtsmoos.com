// B"H
/** lifecycle.js — split bounded awakening phases; no ready hook may freeze loading. */
import { loadingPercent } from "./lifecycle/LifecycleProgress.js?v=mitzvah-lifecycle-split-20260703-bh1";
import { runPhase } from "./lifecycle/LifecycleRunner.js?v=mitzvah-lifecycle-split-20260703-bh1";

export default {
  async runHeescheel(nivrayimMade) {
    await runPhase(this, "heescheel", nivrayimMade, () => [this, { nivrayimMade }]);
    const total = nivrayimMade.length;
    nivrayimMade.forEach((nivra, i) => this.ayshPeula("increase loading percentage", { total:loadingPercent(i, total), reset:false, nivra, action:`Elevating: ${nivra?.name || nivra?.type || i}` }));
  },
  async runMadeAll(nivrayimMade) { await runPhase(this, "madeAll", nivrayimMade, () => [this]); },
  async runReady(nivrayimMade) { await runPhase(this, "ready", nivrayimMade, () => []); },
  async runAfterBriyah(nivrayimMade) { await runPhase(this, "afterBriyah", nivrayimMade, () => []); }
};

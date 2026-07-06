// B"H
/**
 * @file misc.js
 * @description Miscellaneous Olam events, including monotonic loading progress.
 * The loading veil is a river of light. It may slow, it may pause, but it may
 * not fall back to zero and frighten the player into thinking the world died.
 */
export default function miscListeners() {
  this.on("stringify olam", () => this?.getCompiledNivrayimInfo());

  this.on("activeObjectAction", action => {
    const chossid = this.nivrayim.find(q => q.type === "chossid");
    chossid?.ayshPeula("activeObjectAction", action);
  });

  this.on("htmlPeula peula", ({ peulaName, peulaVars }) => {
    try { this.ayshPeula(peulaName, peulaVars); }
    catch (error) { console.error('B"H - htmlPeula peula Error:', error); }
  });

  this.on("ui event", async (shaym, ob) => await this.ayshPeula("send ui event", shaym, ob));

  this.on("htmlPeula", async ob => {
    if (!ob || typeof ob !== "object") return;
    for (const key in ob) await this.ayshPeula(`htmlPeula ${key}`, ob[key]);
  });

  this.on("switch worlds", async worldDayuh => {
    this.ayshPeula("switchWorlds", { worldDayuh, gameState:this.getGameState() });
  });

  let lastAction = null;
  let lastTime = Date.now();
  this.currentLoadingPercentage = Math.max(0, Number(this.currentLoadingPercentage) || 0);

  this.on("increase loading percentage", async ({ amount = 0, action, info = {}, subAction, reset = false, total = null } = {}) => {
    const changedAction = lastAction !== action;
    if (changedAction) lastTime = Date.now();
    const previous = Math.max(0, Number(this.currentLoadingPercentage) || 0);
    const numericTotal = Number(total);
    const numericAmount = Number(amount) || 0;
    const candidate = Number.isFinite(numericTotal)
      ? numericTotal
      : reset
        ? numericAmount
        : previous + Math.max(0, numericAmount);
    const next = Math.max(previous, Math.min(100, Math.max(0, candidate)));
    this.currentLoadingPercentage = next;
    this.__loadingProgressMonotonicDiag = {
      previous,
      amount:numericAmount,
      requestedTotal:Number.isFinite(numericTotal) ? numericTotal : null,
      requestedReset:Boolean(reset),
      total:next,
      preventedRegression:next > candidate,
      action,
      subAction,
      seal:"monotonic-loading-never-zero-reset-20260705-bh1"
    };
    this.ayshPeula("increased percentage", {
      amount:numericAmount,
      action,
      subAction,
      total:next,
      reset:false,
      changedAction,
      elapsedSinceActionMs:Date.now() - lastTime,
      nivra:info?.nivra || null,
      monotonic:true,
      preventedRegression:next > candidate
    });
    lastAction = action;
  });
}

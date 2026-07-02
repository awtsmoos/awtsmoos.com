// B"H
/** @file misc.js @description Miscellaneous Olam events, including monotonic loading progress. */
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

  this.on("increase loading percentage", async ({ amount = 0, action, info = {}, subAction } = {}) => {
    const changedAction = lastAction !== action;
    if (changedAction) lastTime = Date.now();
    const previous = Math.max(0, Number(this.currentLoadingPercentage) || 0);
    const next = Math.max(previous, Math.min(100, previous + Math.max(0, Number(amount) || 0)));
    this.currentLoadingPercentage = next;
    this.ayshPeula("increased percentage", {
      amount,
      action,
      subAction,
      total:next,
      reset:false,
      changedAction,
      elapsedSinceActionMs:Date.now() - lastTime,
      nivra:info?.nivra || null
    });
    lastAction = action;
  });
}

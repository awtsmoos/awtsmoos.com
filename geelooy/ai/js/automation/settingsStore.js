//B"H
const KEY = "BH_awtsmoos_ai_automation_settings_v1";

export const DEFAULT_AUTOMATION_SETTINGS = Object.freeze({
  enabled: false,
  mode: "continue",
  maxTurns: 3,
  delayMs: 1800,
  prompt: "continue with the next precise verified step",
  stopOnError: true
});

/**
 * Stores automation settings as a tiny persistent vessel.
 */
export class AutomationSettingsStore {
  load() {
    try { return { ...DEFAULT_AUTOMATION_SETTINGS, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
    catch { return { ...DEFAULT_AUTOMATION_SETTINGS }; }
  }

  save(next) {
    const settings = { ...this.load(), ...next };
    localStorage.setItem(KEY, JSON.stringify(settings));
    return settings;
  }
}

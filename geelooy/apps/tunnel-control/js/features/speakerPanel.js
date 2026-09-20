// B"H
// Boruch Hashem
// Blessed is He

import { h } from "../ui/core/html.js";
import { callFs } from "../api/tunnel.js";

/**
 * B"H — The Speaker panel: TTS call-outs, output volume, and voice control.
 *
 * The Awtsmoos lets an authorized operator address the house aloud; Awtsmoos.com
 * keeps the master switch visible, the volume honest, and every test harmless.
 * The panel never speaks on load — only explicit buttons make sound.
 */

const SAFE_TEST_PHRASE = "Speaker check. This is a short test.";

export function createSpeakerPanel() {
  const status = h("div", { classes: ["awt-speaker-status"], text: "Loading speaker state…" });
  const out = h("div", { classes: ["awt-remote-output"] });

  const enabledBox = h("input", { attrs: { id: "spkEnabled", type: "checkbox", checked: "checked" } });
  const volumeRange = h("input", { attrs: { id: "spkVolume", type: "range", min: "0", max: "100", value: "50" } });
  const volumeNum = h("strong", { attrs: { id: "spkVolumeNum" }, text: "50" });
  const voiceSelect = h("select", { attrs: { id: "spkVoice" } });
  const speakText = h("input", { attrs: { id: "spkText", type: "text", maxlength: "500", placeholder: "Text for the Mac to speak (max 500 chars)…", size: "48" } });
  const speakRate = h("input", { attrs: { id: "spkRate", type: "number", min: "50", max: "500", placeholder: "wpm" } });
  const calloutText = h("input", { attrs: { id: "spkCallout", type: "text", maxlength: "500", placeholder: "Hey, come over here!", size: "48" } });

  const tunnelName = () => (window.awtsGetTunnelName && window.awtsGetTunnelName()) || "auto";

  async function run(payload) {
    out.replaceChildren(render({ ok: true, action: payload.action, uiMessage: "Running…" }));
    try {
      const data = await callFs(tunnelName(), payload);
      out.replaceChildren(render(data));
      return data;
    } catch (error) {
      const data = { ok: false, action: payload.action, error: error && error.message ? error.message : String(error) };
      out.replaceChildren(render(data));
      return data;
    }
  }

  async function refresh() {
    const data = await run({ action: "macSpeakerState" });
    if (data && data.ok) {
      enabledBox.checked = data.enabled !== false;
      if (typeof data.outputVolume === "number") {
        volumeRange.value = String(data.outputVolume);
        volumeNum.textContent = String(data.outputVolume);
      }
      const voices = Array.isArray(data.voices) ? data.voices : [];
      voiceSelect.replaceChildren(
        h("option", { attrs: { value: "" }, text: "Default voice" }),
        ...voices.map((v) => h("option", { attrs: { value: v }, text: v }))
      );
      if (data.defaultVoice) voiceSelect.value = data.defaultVoice;
      const last = data.lastSpokeAt ? new Date(data.lastSpokeAt).toLocaleString() : "never";
      status.textContent = `Speaker ${data.enabled === false ? "OFF" : "ON"} · volume ${data.outputVolume ?? "unknown"} · queue ${data.queueDepth ?? 0} · last spoke ${last}`;
    } else {
      status.textContent = "Speaker state unavailable.";
    }
  }

  async function toggleEnabled() {
    const data = await run({ action: "macSpeakerSetEnabled", enabled: enabledBox.checked });
    if (data && data.ok) status.textContent = `Speaker ${data.enabled ? "ON" : "OFF"}`;
  }

  async function setVolume() {
    const data = await run({ action: "macSpeakerVolume", volume: Number(volumeRange.value) });
    if (data && data.ok) {
      volumeNum.textContent = String(data.volume);
      status.textContent = `Speaker volume ${data.volume}`;
    }
  }

  async function speak(text) {
    const phrase = (text !== undefined ? text : speakText.value).trim();
    if (!phrase) {
      out.replaceChildren(render({ ok: false, action: "macSpeak", error: "Type something first — the panel never speaks on its own." }));
      return;
    }
    const payload = { action: "macSpeak", text: phrase };
    if (voiceSelect.value) payload.voice = voiceSelect.value;
    const rate = Number(speakRate.value);
    if (Number.isFinite(rate) && rate > 0) payload.rate = rate;
    const data = await run(payload);
    if (data && data.ok) refresh();
  }

  async function callOut() {
    const payload = { action: "macCallOut", restoreVolume: true };
    const message = calloutText.value.trim();
    if (message) payload.message = message;
    if (voiceSelect.value) payload.voice = voiceSelect.value;
    const data = await run(payload);
    if (data && data.ok) refresh();
  }

  volumeRange.addEventListener("input", () => { volumeNum.textContent = volumeRange.value; });

  const enableRow = h("label", { classes: ["field"], children: [
    h("span", { text: "Speaker enabled (default on)" }), enabledBox
  ] });
  enabledBox.addEventListener("change", toggleEnabled);

  const volumeRow = h("label", { classes: ["field"], children: [
    h("span", { text: "Output volume" }), volumeRange, volumeNum,
    h("button", { attrs: { type: "button" }, text: "Set volume" })
  ] });
  volumeRow.querySelector("button").addEventListener("click", setVolume);

  const voiceRow = h("label", { classes: ["field"], children: [
    h("span", { text: "Voice" }), voiceSelect
  ] });

  const speakRow = h("div", { classes: ["field"], children: [
    h("span", { text: "Speak aloud" }), speakText, speakRate,
    h("button", { attrs: { type: "button" }, text: "Speak" })
  ] });
  speakRow.querySelector("button").addEventListener("click", () => speak());

  const calloutRow = h("div", { classes: ["field"], children: [
    h("span", { text: "Call-out (boosts volume, then restores)" }), calloutText,
    h("button", { attrs: { type: "button" }, text: "Call out" })
  ] });
  calloutRow.querySelector("button").addEventListener("click", callOut);

  const testBtn = h("button", { attrs: { type: "button" }, text: "🔊 Safe test (short phrase)" });
  testBtn.addEventListener("click", () => speak(SAFE_TEST_PHRASE));
  const refreshBtn = h("button", { attrs: { type: "button" }, text: "Refresh state" });
  refreshBtn.addEventListener("click", refresh);

  const head = h("div", { classes: ["awt-zone-head"], children: [
    h("h3", { text: "Mac Speaker" }),
    h("p", { text: "Make the Mac speak aloud through its speakers: TTS call-outs, output volume, and voice. Rate-limited and audit-logged; nothing here speaks until you press a button." })
  ] });

  const panel = h("section", { classes: ["awt-speaker-panel"], children: [
    head,
    status,
    h("div", { classes: ["awt-speaker-grid"], children: [enableRow, volumeRow, voiceRow, speakRow, calloutRow] }),
    h("div", { classes: ["awt-quick-actions"], children: [testBtn, refreshBtn] }),
    out
  ] });

  refresh();
  return panel;
}

function render(value) {
  const box = h("div", { classes: ["awt-result-card", value && value.ok === false ? "awt-result-error" : "awt-result-ok"] });
  box.append(h("strong", { text: value && value.action ? value.action : (value && value.ok === false ? "Action failed" : "Result") }));
  if (value && value.uiMessage) box.append(h("span", { text: value.uiMessage }));
  if (value && value.ok === false && value.error) box.append(h("span", { text: `Error: ${value.error}${value.retryAfterMs ? ` (retry in ${Math.ceil(value.retryAfterMs / 1000)}s)` : ""}` }));
  if (value && value.ok && value.action === "macSpeak") box.append(h("span", { text: `Spoke ${value.textLength} chars${value.voice ? ` as ${value.voice}` : ""}.` }));
  if (value && value.ok && value.action === "macCallOut") box.append(h("span", { text: `Called out at volume ${value.boostedTo}${value.restored ? `; volume restored to ${value.previousVolume}` : ""}.` }));
  box.append(h("details", { children: [h("summary", { text: "Raw JSON" }), h("pre", { text: JSON.stringify(value, null, 2).slice(0, 12000) })] }));
  return box;
}

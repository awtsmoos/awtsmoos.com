// B"H
/**
 * @file settingsPanel.js
 * @description Chapter 653: Android receives a small control room.
 */
const KEY = "awtsmoosMobileSettings";
const DEFAULTS = { invertY: true, invertX: true, uiScale: 1, actionLift: 128, quality: "balanced", reducedMotion: true };
function read() { try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return { ...DEFAULTS }; } }
function save(s) { localStorage.setItem(KEY, JSON.stringify(s)); apply(s); }
function worker() { return window.mana?.socket?.eved || window.mana?.eved || null; }
function apply(s = read()) {
  window.__AWTSMOOS_MOBILE_SETTINGS__ = s;
  document.documentElement.style.setProperty("--awts-ui-scale", String(s.uiScale || 1));
  document.documentElement.style.setProperty("--awts-mobile-action-bottom", `calc(var(--awts-mobile-safe-bottom, 10px) + ${Number(s.actionLift || 128)}px)`);
  document.body?.classList.toggle("awts-reduced-motion", !!s.reducedMotion);
  document.body?.classList.toggle("awts-quality-speed", s.quality === "speed");
  worker()?.postMessage?.({ mobileSettingsChanged: s });
  window.dispatchEvent(new Event("resize"));
}
function copy() { return JSON.stringify({ settings: read(), touch: window.__AWTSMOOS_TOUCH_TRACE__?.slice?.(-30) || [], diag: window.__AWTSMOOS_DIAG_COPY__?.() || null, viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio } }, null, 2); }
function stop(e) { e.preventDefault(); e.stopPropagation(); }
function row(label, key, type = "toggle", values = []) {
  return { className: "awts-setting-row", children: [{ tag: "span", textContent: label }, { tag: type === "select" ? "select" : "button", textContent: type === "select" ? undefined : "", ready(el) { const paint = () => { const s = read(); if (type === "select") el.value = s[key]; else el.textContent = s[key] ? "ON" : "OFF"; }; if (type === "select") values.forEach(v => el.append(new Option(v, v))); el.addEventListener(type === "select" ? "change" : "pointerdown", e => { stop(e); const s = read(); s[key] = type === "select" ? el.value : !s[key]; save(s); paint(); }); paint(); } }] };
}
const css = `
#awtsMobileSettingsGear{position:fixed;right:10px;top:calc(env(safe-area-inset-top,0px) + 76px);z-index:30000;width:42px;height:42px;border-radius:14px;border:1px solid #ffe08a;background:rgba(10,15,24,.72);color:#fff6c9;font:900 22px system-ui;box-shadow:0 8px 22px #0008;pointer-events:auto;touch-action:manipulation}
#awtsMobileSettings{position:fixed;inset:auto 10px calc(env(safe-area-inset-bottom,0px) + 84px) 10px;z-index:30001;display:none;max-height:58vh;overflow:auto;border:1px solid #ffe08a;border-radius:18px;background:linear-gradient(180deg,rgba(9,14,21,.96),rgba(20,31,42,.94));color:#fff6c9;padding:12px;box-shadow:0 16px 44px #000c;pointer-events:auto}
#awtsMobileSettings.open{display:block}.awts-setting-title{font:900 18px system-ui;margin:0 0 8px}.awts-setting-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px;margin:6px 0;border-radius:12px;background:rgba(255,255,255,.07)}
.awts-setting-row button,.awts-setting-row select,.awts-setting-copy{border:0;border-radius:10px;background:#6937ee;color:white;font-weight:900;padding:8px 12px}.awts-setting-copy{width:100%;margin-top:8px}.awts-reduced-motion *{transition:none!important;animation:none!important}body.awts-quality-speed [class*="overlay" i]{backdrop-filter:none!important}
@media(max-width:760px){#actionBar{scale:var(--awts-ui-scale,1);transform-origin:bottom center!important}}
`;
export default { id: "awtsMobileSettingsRoot", children: [
  { id: "awtsMobileSettingsGear", textContent: "⚙", ready(el) { apply(); el.addEventListener("pointerdown", e => { stop(e); document.getElementById("awtsMobileSettings")?.classList.toggle("open"); }); } },
  { id: "awtsMobileSettings", children: [
    { className: "awts-setting-title", textContent: "B\"H Mobile Settings" },
    row("Joystick vertical invert", "invertY"), row("Joystick horizontal invert", "invertX"), row("Reduced motion / no blur", "reducedMotion"), row("Quality", "quality", "select", ["speed", "balanced", "beauty"]),
    { className: "awts-setting-copy", tag: "button", textContent: "COPY DIAGNOSTICS", ready(el) { window.__AWTSMOOS_MOBILE_SETTINGS_COPY__ = copy; el.addEventListener("pointerdown", e => { stop(e); navigator.clipboard?.writeText?.(copy()); console.info("B\"H | MOBILE_SETTINGS_COPY", copy()); }); } },
    { className: "awts-setting-copy", tag: "button", textContent: "RESET DEFAULTS", ready(el) { el.addEventListener("pointerdown", e => { stop(e); save({ ...DEFAULTS }); }); } }
  ] }, { tag: "style", innerHTML: css }
] };

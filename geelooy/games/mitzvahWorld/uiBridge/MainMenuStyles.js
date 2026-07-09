// B"H
/** Installs menu/test-scene CSS once. */
export function installMainMenuStyles() {
  if (document.getElementById("awts-main-menu-tests-style")) return;
  const style = document.createElement("style");
  style.id = "awts-main-menu-tests-style";
  style.textContent = `
    .awts-menu-root{position:fixed;inset:0;z-index:100000;display:grid;place-items:center;background:radial-gradient(circle at 50% 18%,#18456f,#071324 62%,#04100b);color:white;font-family:system-ui,sans-serif;overflow:auto;padding:20px;box-sizing:border-box}.awts-menu-card{width:min(760px,92vw);border:1px solid rgba(255,217,102,.45);border-radius:24px;background:linear-gradient(180deg,rgba(5,18,34,.92),rgba(3,8,15,.86));box-shadow:0 22px 70px rgba(0,0,0,.42);padding:24px;display:grid;gap:14px}.awts-menu-title{font-size:clamp(36px,8vw,72px);font-weight:1000;letter-spacing:.04em;color:#fff;text-shadow:0 0 24px #00f3ff;margin:0}.awts-menu-sub{color:#d8fff8;line-height:1.45}.awts-menu-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}.awts-menu-root button,.awts-test-panel button{border:1px solid rgba(255,217,102,.5);border-radius:13px;background:linear-gradient(180deg,rgba(255,231,122,.18),rgba(0,243,255,.08));color:#fff6c7;font-weight:900;padding:12px;cursor:pointer}.awts-menu-root button:hover,.awts-test-panel button:hover{filter:brightness(1.18)}.awts-test-panel{position:fixed;left:12px;top:12px;right:12px;z-index:100001;display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap;pointer-events:none}.awts-test-panel>*{pointer-events:auto}.awts-test-title,.awts-test-readout{background:rgba(0,10,18,.78);border:1px solid rgba(255,217,102,.38);border-radius:12px;color:#fff6c7;padding:10px 12px;font:800 12px system-ui}.awts-test-controls{display:flex;gap:8px;flex-wrap:wrap;max-height:40vh;overflow:auto}.awts-test-controls input{accent-color:#ffd966}`;
  document.head.append(style);
}

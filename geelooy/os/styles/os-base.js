//B"H
export default id => /*css*/`
.${id}.desktop {
  position: relative;
  width: 100vw;
  height: calc(100vh - 40px);
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 18%, rgba(255,255,255,.36), transparent 16%),
    linear-gradient(135deg, #1d4ed8 0%, #0f766e 52%, #166534 100%);
  font-family: "Trebuchet MS", Tahoma, system-ui, sans-serif;
}
.${id}.desktop::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,.12), transparent 38%), radial-gradient(circle at 90% 88%, rgba(255,255,255,.18), transparent 28%);
  pointer-events: none;
}
.${id} .awtsmoos-desktop-surface {
  position: absolute;
  inset: 14px 0 0 10px;
  z-index: 1;
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(auto-fill, 92px);
  grid-auto-columns: 104px;
  align-content: start;
  justify-content: start;
  gap: 12px 10px;
  padding: 8px;
}
.${id} .desktop-icon {
  width: 96px;
  min-height: 86px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: white;
  display: grid;
  justify-items: center;
  align-content: start;
  gap: 4px;
  padding: 7px 5px;
  text-shadow: 1px 1px 2px rgba(0,0,0,.75);
  cursor: default;
}
.${id} .desktop-icon:hover, .${id} .desktop-icon.selected {
  border-color: rgba(255,255,255,.45);
  background: rgba(49, 124, 255, .34);
  box-shadow: inset 0 0 0 1px rgba(49,124,255,.4);
}
.${id} .desktop-icon-glyph {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  font-size: 34px;
  filter: drop-shadow(1px 3px 2px rgba(0,0,0,.38));
}
.${id} .desktop-icon-label {
  max-width: 88px;
  padding: 1px 3px;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.18;
  text-align: center;
  overflow-wrap: anywhere;
}
.${id} .desktop-icon.selected .desktop-icon-label { background: #0b55d9; }
.contextMenu {
  position: absolute;
  z-index: 100000;
  min-width: 188px;
  padding: 4px;
  border: 1px solid #0f3d91;
  border-radius: 3px;
  background: #f2f2ea;
  color: #111827;
  box-shadow: 3px 5px 18px rgba(0,0,0,.32);
  font: 12px Tahoma, system-ui, sans-serif;
}
.contextMenu .menuItem { padding: 7px 22px; cursor: default; border-radius: 2px; }
.contextMenu .menuItem:hover { background: #316ac5; color: white; }
`;

/** B"H: the OS root becomes an XP-like desktop, blue-green and full of gates. */

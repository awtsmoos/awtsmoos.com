// B"H
export default /*css*/`
.input-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(2,6,23,.58);
  backdrop-filter: blur(12px);
  animation: awtsFadeIn .18s ease both;
}
.input-dialog {
  width: min(420px, 100%);
  padding: 24px;
  border: 1px solid rgba(125,211,252,.28);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(15,23,42,.96), rgba(8,16,29,.96));
  color: var(--awts-explorer-text);
  box-shadow: var(--awts-explorer-shadow);
  animation: awtsScaleIn .2s ease both;
}
.dialog-title { margin-bottom: 16px; font-size: 18px; font-weight: 950; letter-spacing: -.02em; }
.input-dialog input {
  width: 100%;
  margin-bottom: 18px;
  padding: 12px 14px;
  border: 1px solid rgba(125,211,252,.26);
  border-radius: 14px;
  outline: 0;
  background: rgba(2,6,23,.48);
  color: var(--awts-explorer-text);
  font: inherit;
}
.input-dialog input:focus { border-color: rgba(52,211,153,.72); box-shadow: 0 0 0 3px rgba(52,211,153,.14); }
.dialog-buttons { display: flex; justify-content: flex-end; gap: 10px; }
.dialog-buttons button, .selection-action-bar button {
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 999px;
  background: rgba(255,255,255,.09);
  color: var(--awts-explorer-text);
  padding: 8px 14px;
  cursor: pointer;
  font-weight: 900;
}
.dialog-buttons button:first-child { background: rgba(52,211,153,.22); border-color: rgba(52,211,153,.42); }
.selection-action-bar {
  position: absolute;
  left: 50%;
  bottom: 24px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 16px;
  border: 1px solid rgba(125,211,252,.28);
  border-radius: 999px;
  background: rgba(2,6,23,.82);
  box-shadow: var(--awts-explorer-shadow);
  transform: translateX(-50%);
  backdrop-filter: blur(14px);
}
.selection-action-bar span { font-weight: 950; color: #bbf7d0; }
.selection-action-bar .cancel-btn { background: rgba(251,113,133,.2); border-color: rgba(251,113,133,.38); }
@keyframes awtsFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes awtsScaleIn { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } }
`;

/** B"H: dialogs open like sealed courts, not browser prompts in disguise. */

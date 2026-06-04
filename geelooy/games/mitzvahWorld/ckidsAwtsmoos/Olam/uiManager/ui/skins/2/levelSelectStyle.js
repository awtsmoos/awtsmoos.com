// B"H
/**
 * @module levelSelectStyle
 * @description
 * Chapter 398: The challenge board becomes a mobile-safe sealed scroll.
 */
export default /*css*/`
.level-select-container {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(12px);
  z-index: 15000;
  opacity: 0;
  animation: fadeIn 0.25s forwards;
  font-family: Arial, sans-serif;
  padding: calc(16px + env(safe-area-inset-top)) 14px calc(88px + env(safe-area-inset-bottom));
  box-sizing: border-box;
  pointer-events: auto;
  touch-action: none;
}
.level-select-container.hidden { display: none !important; }
.level-select-container * { box-sizing: border-box; pointer-events: auto; touch-action: manipulation; }
.ls-glass-panel {
  width: min(980px, calc(100vw - 28px));
  max-height: min(760px, calc(100dvh - 118px));
  overflow-y: auto;
  background: linear-gradient(135deg, rgba(22, 13, 43, 0.98), rgba(12, 8, 24, 0.99));
  border: 3px solid #d7b665;
  border-radius: 28px;
  box-shadow: 0 20px 70px rgba(0,0,0,.55), inset 0 0 22px rgba(255, 213, 74, .12);
  color: white;
  scrollbar-width: thin;
  scrollbar-color: #ffd54a transparent;
  -webkit-overflow-scrolling: touch;
}
.ls-header {
  background: linear-gradient(90deg, #3a2208, #6c3b10, #332060);
  padding: 18px;
  border-bottom: 3px solid #d7b665;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}
.ls-title {
  font-size: clamp(22px, 5.4vw, 34px);
  font-weight: 900;
  color: #ffd54a;
  text-shadow: 0 0 12px rgba(255,213,74,.45);
  letter-spacing: 1px;
  margin: 0;
}
.ls-close-btn {
  min-width: 58px;
  min-height: 52px;
  border: 0;
  border-radius: 16px;
  background: #835b1b;
  color: #fff;
  font-weight: 900;
  font-size: 22px;
}
.ls-body {
  padding: 18px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
  gap: 12px;
}
.ls-card {
  background: linear-gradient(135deg, rgba(91,56,255,.78), rgba(37, 18, 84, .94));
  border: 2px solid rgba(255, 255, 255, 0.18);
  border-radius: 18px;
  padding: 14px;
  text-align: left;
  cursor: pointer;
  min-height: 148px;
  box-shadow: 0 10px 28px rgba(0,0,0,.22);
}
.ls-card.unlocked { border-color: rgba(255, 213, 74, .7); }
.ls-card:hover { transform: translateY(-2px); border-color: #ffd54a; }
.ls-icon { font-size: 30px; margin-bottom: 8px; color: #ffd54a; font-weight: 900; }
.ls-card-title { color: #fff6c5; font-size: 17px; margin-bottom: 7px; font-weight: 900; }
.ls-card-desc { font-size: 13px; color: #ddd7ff; line-height: 1.32; }
.ls-card-lock { margin-top: 10px; color: #3cff86; font-size: 13px; font-weight: 900; }
@media (max-width: 390px) { .ls-body { grid-template-columns: 1fr 1fr; padding: 12px; gap: 10px; } .ls-card { min-height: 138px; padding: 12px; } }
@keyframes fadeIn { to { opacity: 1; } }
`;

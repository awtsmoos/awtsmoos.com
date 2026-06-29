// B"H
/** @file npcCssPortraitCore.js @description Core portrait frame CSS. */
export const NPC_UI_PORTRAIT_CORE = `
.awts-npc-card-wow {
  overflow: hidden;
}

.awts-npc-hero {
  display: grid;
  grid-template-columns: 148px minmax(0, 1fr);
  gap: 18px;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 217, 102, .28);
}

.awts-npc-portrait {
  position: relative;
  min-width: 132px;
  text-align: center;
  color: #ffeaa6;
  filter: drop-shadow(0 8px 18px rgba(0, 0, 0, .55));
}

.awts-npc-portrait-ring {
  position: relative;
  width: 116px;
  height: 116px;
  margin: 0 auto 8px;
  border-radius: 999px;
  padding: 7px;
  background: radial-gradient(circle at 35% 25%, #fff3a7, #d99a1a 42%, #4a2b09 75%, #100a03);
  border: 2px solid #ffdc65;
  box-shadow: inset 0 0 18px rgba(255, 255, 255, .28), 0 0 0 4px rgba(0, 0, 0, .6), 0 14px 26px rgba(0, 0, 0, .55);
}
`;
export default NPC_UI_PORTRAIT_CORE;

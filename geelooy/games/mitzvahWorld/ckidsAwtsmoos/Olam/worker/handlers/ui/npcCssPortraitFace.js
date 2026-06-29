// B"H
/** @file npcCssPortraitFace.js @description Portrait face, name, and badge CSS. */
export const NPC_UI_PORTRAIT_FACE = `
.awts-npc-portrait-face {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: radial-gradient(circle at 50% 20%, #38556e, #101820 55%, #05070b);
  border: 2px solid rgba(255, 255, 255, .24);
  color: #fff4b8;
  font-size: 22px;
  font-weight: 1000;
  letter-spacing: .04em;
}

.awts-npc-portrait-face strong {
  display: block;
  font-size: 24px;
  text-shadow: 0 2px 3px #000;
}

.awts-npc-portrait-emoji {
  display: block;
  font-size: 34px;
  line-height: 1;
  margin-bottom: 2px;
}

.awts-npc-portrait-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.awts-npc-portrait-level {
  position: absolute;
  right: -4px;
  bottom: 8px;
  min-width: 46px;
  padding: 4px 7px;
  border-radius: 999px;
  background: linear-gradient(180deg, #191f2c, #07090f);
  border: 1px solid #ffdc65;
  color: #ffef9a;
  font-size: 12px;
  font-weight: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, .6);
}
`;
export default NPC_UI_PORTRAIT_FACE;

/**
 * B"H
 * @module BattleMoveLayout
 *
 * Chapter 36: The battle received a lower kingdom for choices.
 * The Awtsmoos has no body and no form; this module divides the living phone
 * into calm heavens above and a bottom command deck below, so fingers press
 * answers without suffocating the combatants.
 */
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const rect = (x, y, w, h, i = null) => ({ x, y, w, h, i });

export const battleMoveLayout = (w = 390, h = 844) => {
  const portrait = h >= w;
  const margin = Math.round(clamp(w * .038, 12, 24));
  const gap = Math.round(clamp(h * .009, 7, 11));
  const footerH = Math.round(clamp(h * .058, 42, 56));
  const cardH = Math.round(clamp(h * (portrait ? .073 : .095), 58, 72));
  const promptH = Math.round(clamp(h * .062, 48, 60));
  const responseH = cardH * 4 + gap * 3 + margin * 2;
  const responseY = h - footerH - responseH;
  const promptY = responseY - promptH - gap;
  const headerH = Math.round(clamp(h * .128, 92, 122));
  const stageY = headerH + gap;
  const stageH = Math.max(180, promptY - stageY - gap);
  const cardW = w - margin * 2;
  const rects = Array.from({ length: 4 }, (_, i) => rect(margin, responseY + margin + i * (cardH + gap), cardW, cardH, i));

  return {
    w, h, portrait, margin, gap,
    header: rect(margin, margin, cardW, headerH - margin),
    stage: rect(margin, stageY, cardW, stageH),
    prompt: rect(margin * 1.5, promptY, w - margin * 3, promptH),
    responsePanel: rect(0, responseY, w, responseH),
    footer: rect(0, h - footerH, w, footerH),
    playerCard: rect(margin, margin, (w - margin * 3) / 2, headerH - margin * 1.15),
    enemyCard: rect((w + margin) / 2, margin, (w - margin * 3) / 2, headerH - margin * 1.15),
    player: { x: w * .3, y: stageY + stageH * .62, size: clamp(w * .34, 120, 170) },
    enemy: { x: w * .7, y: stageY + stageH * .58, size: clamp(w * .36, 128, 180) },
    vs: { x: w / 2, y: stageY + stageH * .18 },
    rects
  };
};

export const moveIndexAt = (x, y, layout = battleMoveLayout()) => {
  const hit = layout.rects.find(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
  return hit ? hit.i : null;
};

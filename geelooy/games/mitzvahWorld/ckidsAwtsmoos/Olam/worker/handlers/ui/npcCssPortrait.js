// B"H
/**
 * @file npcCssPortrait.js
 * @description
 * Portrait CSS conductor. The Awtsmoos split the face, frame, and responsive
 * text into readable vessels, then gathers them here for the UI installer.
 */
import { NPC_UI_PORTRAIT_CORE } from './npcCssPortraitCore.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { NPC_UI_PORTRAIT_FACE } from './npcCssPortraitFace.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { NPC_UI_PORTRAIT_TEXT } from './npcCssPortraitText.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export const NPC_UI_PORTRAIT = [
  NPC_UI_PORTRAIT_CORE,
  NPC_UI_PORTRAIT_FACE,
  NPC_UI_PORTRAIT_TEXT
].join('\n');

export default NPC_UI_PORTRAIT;

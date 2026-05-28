// B"H
/**
 * @file index.js
 * @description
 * Chapter 16: The Level 1 UI keeps its tools, but in smaller garments.
 *
 * The Awtsmoos restores the inventory and action vessels so worker events no
 * longer cry into missing names. The UI is not abolished; it is contracted:
 * compact HUD, compact bag, compact inventory, and mobile controls that leave
 * the platformer visible.
 */
import hud from "./hud.js?v=lean-l1-20260528-bh22";
import effectsOverlay from "../components/effectsOverlay.js?v=lean-l1-20260528-bh22";
import joystick from "../joystick.js?v=lean-l1-20260528-bh22";
import ActionBar from "./actionBar.js?v=lean-l1-20260528-bh22";
import InventoryScreen from "./inventory/index.js?v=lean-l1-20260528-bh22";
import { Toast } from "./components/Toast.js";
import { InteractionPrompt } from "./components/InteractionPrompt.js";
import { PerutahProgress } from "./perutahProgress.js?v=lean-l1-20260528-bh22";

const isMobileLike = typeof navigator !== "undefined" && /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");

const compactMobileStyle = {
  tag: "style",
  innerHTML: `
    .awtsmoosAction {
      position: fixed !important;
      right: 88px !important;
      bottom: 38px !important;
      width: 58px !important;
      height: 58px !important;
      z-index: 12001 !important;
      pointer-events: auto !important;
    }
    .awtsmoosAction .minimize { display: none !important; }
    .awtsmoosAction .slots { width: 58px !important; height: 58px !important; pointer-events: auto !important; }
    .awtsmoosAction .actionSlot:not(.bag-slot) { display: none !important; }
    .awtsmoosAction .bag-slot {
      width: 58px !important; height: 58px !important; border-radius: 50% !important;
      background: rgba(13,4,52,.72) !important; border: 3px solid rgba(255,215,0,.55) !important;
      box-shadow: 0 7px 14px rgba(0,0,0,.42) !important; pointer-events: auto !important;
    }
    .awtsmoosAction .innerSlot, .awtsmoosAction .slotBtn { width: 100% !important; height: 100% !important; }
    .awtsmoosInventoryViewer {
      position: fixed !important; left: 3vw !important; right: 3vw !important; top: 12vh !important;
      bottom: 12vh !important; width: auto !important; height: auto !important; z-index: 20000 !important;
      background: rgba(20,12,4,.90) !important; border: 2px solid rgba(255,215,0,.55) !important;
      border-radius: 18px !important; overflow: auto !important; color: #ffe9a8 !important;
    }
    .awtsmoosInventoryViewer.hidden { display: none !important; }
    .awtsmoosInventoryViewer .header { position: sticky !important; top: 0 !important; background: rgba(10,5,1,.92) !important; z-index: 2 !important; }
    .awtsmoosInventoryViewer .inventory-body { max-height: calc(76vh - 56px) !important; overflow: auto !important; }
    .awtsmoosInventoryViewer .close { font-size: 22px !important; padding: 8px 12px !important; pointer-events: auto !important; }
    .awtsmoosContextMenu { z-index: 21000 !important; pointer-events: auto !important; }
  `
};

const uiVessels = [
  hud,
  PerutahProgress,
  ActionBar,
  InventoryScreen,
  effectsOverlay,
  Toast,
  InteractionPrompt,
  compactMobileStyle
];

if (isMobileLike) uiVessels.push(...joystick);

export default uiVessels;

// B"H
import skin from "./skins/2/index.js";
import dialogueStyle from "./gameUI/components/DialogueVesselStyle.js";

/**
 * @file style.js
 * @description
 * Chapter 8: The global skin stops the old black/cyan context ghost from
 * appearing over the wardrobe. The Awtsmoos lets dedicated Bag and Market
 * vessels rule their own screens while every stale context menu is hidden.
 */
export default {
  tag: "style",
  innerHTML: /*css*/`
    :root { --neon-cyan:#00f3ff; --mitzvah-gold:#ffde40; --void-bg:#0a0a1e; }
    ${dialogueStyle}
    body, html { margin:0; padding:0; width:100%; height:100%; background:#000; overflow:hidden; user-select:none; overscroll-behavior:none; touch-action:none!important; }
    .mainAv { position:fixed!important; inset:0!important; overflow:hidden!important; background:#000; z-index:1; }
    canvas { position:absolute; inset:0; width:100%!important; height:100%!important; display:block; z-index:1; touch-action:none!important; }
    .gameUi { position:fixed; inset:0; z-index:10000; pointer-events:none!important; overflow:visible; }
    .hidden { display:none!important; visibility:hidden!important; }
    .awtsmoosContextMenu { display:none!important; visibility:hidden!important; pointer-events:none!important; }

    button, a, input, select, textarea, .awtsmoosBtn, .mitzvahBtn, .controller-button,
    #joystick-container, #joystick-base, #inventoryScreen, #inventoryScreen *, .store-container,
    .store-container *, #awtsmoos-npc-overlay, #awtsmoos-npc-overlay *, .awtsmoosAction .minimize,
    .awtsmoosAction .actionSlot, .bag-slot, .slotBtn, .innerSlot { pointer-events:auto!important; cursor:pointer; touch-action:manipulation; -webkit-tap-highlight-color:transparent; }
    .gameUi > div:not([id="joystick-container"]):not([id="game-controller"]):not([id="inventoryScreen"]):not([id="storeScreen"]), .menuTop { pointer-events:none!important; }

    .game-hud { position:absolute; top:70px; left:20px; display:flex; flex-direction:column; gap:8px; z-index:1000; pointer-events:none; font-family:'Fredoka One', sans-serif; }
    .hud-bar-container { height:25px; background:rgba(0,0,0,.6); border-radius:12px; border:2px solid #555; position:relative; overflow:hidden; pointer-events:none; }
    .hud-bar { height:100%; transition:width .2s; }
    .hud-text { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:white; font-size:14px; text-shadow:1px 1px 2px black; }
    .awtsmoos-tooltip { position:fixed; z-index:99999; background:black; color:#00ff00; padding:8px 12px; border:1px solid #00ff00; border-radius:4px; font:16px 'Courier New', monospace; text-shadow:0 0 5px #00ff00; box-shadow:0 0 10px rgba(0,255,0,.5); pointer-events:none; white-space:nowrap; }

    ${skin}

    .awtsmoosContextMenu { display:none!important; visibility:hidden!important; pointer-events:none!important; }
    .awtsmoosAction { position:fixed!important; right:18px!important; bottom:18px!important; z-index:40000!important; pointer-events:none!important; }
    .awtsmoosAction .slots { display:flex!important; flex-direction:row!important; gap:8px!important; padding:10px!important; background:rgba(18,14,9,.75)!important; border:2px solid rgba(255,221,128,.55)!important; border-radius:18px!important; backdrop-filter:blur(6px)!important; }
    .awtsmoosAction .actionSlot { width:64px!important; height:64px!important; border-radius:14px!important; background:rgba(0,0,0,.42)!important; border:2px solid rgba(255,221,128,.45)!important; display:flex!important; align-items:center!important; justify-content:center!important; box-shadow:inset 0 0 16px rgba(0,0,0,.55)!important; }
    .awtsmoosAction .innerSlot { width:54px!important; height:54px!important; border-radius:12px!important; display:flex!important; align-items:center!important; justify-content:center!important; overflow:hidden!important; }
    .awtsmoosAction .slotBtn { width:100%!important; height:100%!important; background-size:contain!important; background-position:center!important; background-repeat:no-repeat!important; color:#fff!important; display:flex!important; align-items:center!important; justify-content:center!important; }

    .floating-text { position:fixed; z-index:70000; transform:translate(-50%,-50%); font-size:26px; font-weight:900; text-shadow:0 3px 8px #000; animation:awtsTextRise 1.8s ease-out forwards; pointer-events:none; }
    .hebrew-particle { position:fixed; z-index:70001; font-size:34px; font-weight:900; color:#ffd34d; text-shadow:0 0 12px #ff3355,0 4px 8px #000; pointer-events:none; animation:awtsLetterBurst 1.6s ease-out forwards; }
    .hebrew-particle.spike { font-size:46px; color:#ffdf70; }
    .awtsmoos-reset-gate { position:fixed; inset:0; z-index:70002; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; background:rgba(70,0,0,.28); color:#fff4c7; text-align:center; pointer-events:auto; text-shadow:0 4px 10px #000; }
    .reset-title { font-size:clamp(42px,9vw,110px); font-weight:900; color:#ffdf70; }
    .reset-subtitle { font-size:clamp(18px,3vw,36px); font-weight:900; background:rgba(0,0,0,.55); border:2px solid #ffdf70; border-radius:16px; padding:12px 20px; }
    @keyframes awtsTextRise { from{opacity:1; transform:translate(-50%,-50%) scale(1)} to{opacity:0; transform:translate(-50%,-150%) scale(1.25)} }
    @keyframes awtsLetterBurst { from{opacity:1; transform:translate(-50%,-50%) scale(.5) rotate(0deg)} to{opacity:0; transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(1.4) rotate(720deg)} }
  `
};

// B"H
/** Minimal entry: menu first, no gameplay/Three imports until a button is chosen. */
import { installMainMenuGate } from "./uiBridge/MainMenuGate.js?compact=true&v=minimal-blue-cube-20260708-bh1";

async function startGameplay() {
  window.__AWTS_MINIMAL_ENTRY__ = { mode:"gameplay", at:Date.now() };
  const module = await import("./uiBridge/bootIkar.js?compact=true&v=minimal-blue-cube-20260708-bh1");
  module.bootIkarNow();
}

function mount() {
  window.__AWTS_MINIMAL_ENTRY__ = { mode:"menu", at:Date.now(), seal:"minimal-blue-cube-20260708-bh1" };
  installMainMenuGate({ startGameplay });
}

document.readyState === "loading" ? addEventListener("DOMContentLoaded", mount, { once:true }) : mount();

// B"H
/** Minimal main menu gate: all heavy scenes are lazy-imported only after clicks. */
import { installMainMenuStyles } from "./MainMenuStyles.js?compact=true&v=minimal-blue-cube-20260708-bh1";
const qs = () => new URLSearchParams(location.search);
const ikar = () => document.getElementById("ikar") || document.body;
function clearScene() { document.getElementById("awtsMainMenu")?.remove(); document.querySelectorAll(".awts-test-panel").forEach(n => n.remove()); ikar().replaceChildren(); }
function desiredPath() { return qs().get("path") || "mayNewYearVillage.json"; }
function setPath(path) { const u = new URL(location.href); u.searchParams.set("path", path || desiredPath()); history.replaceState(history.state, "", u.href); }
function back(startGameplay) { clearScene(); installMainMenuGate({ startGameplay }); }
async function cube(startGameplay) { clearScene(); const m = await import("./testScenes/BlueCubeTestScene.js?compact=true&v=minimal-blue-cube-20260708-bh1"); m.startBlueCubeTest(() => back(startGameplay)); }
async function terrain(startGameplay) { clearScene(); const m = await import("./testScenes/TerrainTestScene.js?compact=true&v=minimal-blue-cube-20260708-bh1"); m.startTerrainTest(() => back(startGameplay)); }
async function chossid(startGameplay) { clearScene(); const m = await import("./testScenes/ChossidAnimationTestScene.js?compact=true&v=minimal-blue-cube-20260708-bh1"); m.startChossidAnimationTest(() => back(startGameplay)); }
export function installMainMenuGate({ startGameplay }) {
  installMainMenuStyles(); clearScene();
  const root = document.createElement("div"); root.id = "awtsMainMenu"; root.className = "awts-menu-root";
  root.innerHTML = `<section class="awts-menu-card"><h1 class="awts-menu-title">MITZVAH WORLD</h1><div class="awts-menu-sub">Minimal shell: no loading veil, no worker, no Three until a test is clicked.</div><div class="awts-menu-grid"></div><div class="awts-menu-sub" id="awtsMenuStatus">selected world: ${desiredPath()}</div></section>`;
  const grid = root.querySelector(".awts-menu-grid");
  const button = (text, fn) => { const b = document.createElement("button"); b.textContent = text; b.onclick = fn; grid.append(b); };
  button("One rotating blue cube", () => cube(startGameplay));
  button("Terrain material test", () => terrain(startGameplay));
  button("Chossid animation test", () => chossid(startGameplay));
  button("Play selected world", () => { setPath(desiredPath()); clearScene(); startGameplay?.(); });
  button("Use mayNewYearVillage.json", () => { setPath("mayNewYearVillage.json"); root.querySelector("#awtsMenuStatus").textContent = `selected world: ${desiredPath()}`; });
  document.body.append(root); window.__AWTS_MAIN_MENU__ = { visible:true, selectedPath:desiredPath(), seal:"minimal-blue-cube-20260708-bh1" };
  const direct = qs().get("testScene"); if (direct === "cube") cube(startGameplay); if (direct === "terrain") terrain(startGameplay); if (direct === "chossid") chossid(startGameplay);
}

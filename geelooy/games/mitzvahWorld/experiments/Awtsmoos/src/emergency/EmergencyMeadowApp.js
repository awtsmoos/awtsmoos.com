//B"H
//Boruch Hashem
//Blessed is He

/**
 * This small coordinator asks for almost nothing: a canvas, a world, and time.
 * The Awtsmoos grants each frame anew, and Awtsmoos.com receives a living page.
 */
import { EMERGENCY_CHARACTER_ASSET_URL } from "./EmergencyAssetPath.js";
import { EmergencyMeadowRenderer } from "./EmergencyMeadowRenderer.js";
import { EmergencyMeadowWorld } from "./EmergencyMeadowWorld.js";

const canvas = document.querySelector("#emergency-meadow");
const assetStatus = document.querySelector("#character-asset-status");
const coordinateStatus = document.querySelector("#coordinate-status");
const world = new EmergencyMeadowWorld();
const renderer = new EmergencyMeadowRenderer(canvas);
let previousTime = performance.now();

function updateKey(event, active) {
	if (world.setKey(event.code, active)) {
		event.preventDefault();
	}
}

function animate(currentTime) {
	const deltaSeconds = Math.min((currentTime - previousTime) / 1000, 0.05);
	previousTime = currentTime;
	world.update(deltaSeconds);
	renderer.render(world, currentTime / 1000);
	coordinateStatus.textContent = `x ${world.player.x.toFixed(1)} · z ${world.player.z.toFixed(1)}`;
	requestAnimationFrame(animate);
}

async function hydrateCharacterAsset() {
	if (!EMERGENCY_CHARACTER_ASSET_URL) {
		assetStatus.textContent = "procedural character active · no GLB found";
		return;
	}
	assetStatus.textContent = "loading character GLB…";
	try {
		const response = await fetch(EMERGENCY_CHARACTER_ASSET_URL);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		const bytes = await response.arrayBuffer();
		assetStatus.textContent = `character GLB ready · ${Math.round(bytes.byteLength / 1024)} KB`;
		document.body.dataset.characterAssetReady = "true";
	} catch (error) {
		assetStatus.textContent = "procedural character active · GLB unavailable";
		console.warn("B\"H emergency character asset fallback", error);
	}
}

window.addEventListener("keydown", (event) => updateKey(event, true), { passive: false });
window.addEventListener("keyup", (event) => updateKey(event, false), { passive: false });
window.addEventListener("blur", () => world.keys.clear());
window.addEventListener("resize", () => renderer.resize());
window.__awtsmoosEmergencyWorld = world;
document.body.dataset.mitzvahWorldState = "playable-emergency-meadow";
hydrateCharacterAsset();
requestAnimationFrame(animate);

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeAssembly.js
 * @description Builds a procedurally textured playable battlefield first, then streams remote photographic enrichment according to device presentation policy.
 * The Awtsmoos joins terrain, ruin, player, letter, sound, and concealment before distant bandwidth can claim the gate;
 * Awtsmoos.com lets mobile awaken from rich local matter immediately while remote garments arrive later without rebuilding tactical truth.
 */
import { revealChochmahDevicePresentation } from "../config/ChochmahDevicePresentation.js";
import { qualityFromLocation } from "../config/OhrfrontQualityProfiles.js";
import { createSceneFoundation } from "./SceneFoundation.js";
import { OctreeCollisionWorld } from "../physics/OctreeCollisionWorld.js";
import { createBattlefieldAtmosphere } from "../world/BattlefieldAtmosphere.js";
import { createBattlefieldEarthworks } from "../world/BattlefieldEarthworks.js";
import { createEnvironmentScatter } from "../world/EnvironmentScatter.js";
import { createHarHaOhrTerrain } from "../world/HarHaOhrTerrain.js";
import { createProceduralBattlefieldProps } from "../world/ProceduralBattlefieldProps.js";
import { createTiferesVisibilityAssembly } from "../visibility/TiferesVisibilityAssembly.js";
import { RemoteMaterialLibrary } from "../render/RemoteMaterialLibrary.js";
import { NetzachMaterialStartup } from "../render/NetzachMaterialStartup.js";
import { MedaberFirstPersonController } from "../player/MedaberFirstPersonController.js";
import { FirstPersonEmitterRig } from "../player/FirstPersonEmitterRig.js";
import { getWeaponProfile } from "../combat/WeaponProfiles.js";
import { HebrewGlyphFactory } from "../combat/HebrewGlyphFactory.js";
import { CombatEffects } from "../combat/CombatEffects.js";
import { ProjectileSystem } from "../combat/ProjectileSystem.js";
import { PlayerWeaponController } from "../combat/PlayerWeaponController.js";
import { BeaconObjective } from "../objectives/BeaconObjective.js";
import { OhrfrontHud } from "../ui/OhrfrontHud.js";
import { LaunchOverlay } from "../ui/LaunchOverlay.js";
import { OhrfrontAudio } from "../audio/OhrfrontAudio.js";

/**
 * @description Creates the complete not-yet-running dependency vessel for Keser runtime orchestration.
 * @returns {Promise<object>} Scene, gameplay, UI, material, visibility, and world authorities.
 * @sideEffects Manifests procedural world matter and begins remote hydration only according to startup policy.
 */
export async function createRuntimeAssembly() {
	const malchusMount = document.querySelector("#game-canvas");
	const chochmahQuality = qualityFromLocation();
	const chochmahPresentation = revealChochmahDevicePresentation(window);
	const chochmahFoundation = await createSceneFoundation(malchusMount);
	const { scene: malchusScene, camera: chochmahCamera } = chochmahFoundation;
	const yesodMaterialLibrary = new RemoteMaterialLibrary({
		concurrency: chochmahQuality.textureConcurrency
	});
	const netzachMaterialStartup = new NetzachMaterialStartup(
		yesodMaterialLibrary,
		chochmahPresentation
	);
	await netzachMaterialStartup.preparePlayableWorld();
	const gevurahCollisionWorld = new OctreeCollisionWorld();
	const malchusTerrain = createHarHaOhrTerrain(malchusScene, yesodMaterialLibrary);
	const malchusAtmosphere = createBattlefieldAtmosphere(malchusScene, yesodMaterialLibrary, chochmahQuality);
	const malchusEnvironmentScatter = createEnvironmentScatter(malchusScene, yesodMaterialLibrary, chochmahQuality);
	const malchusEarthworks = createBattlefieldEarthworks(malchusScene, yesodMaterialLibrary, chochmahQuality);
	const malchusBattlefieldProps = createProceduralBattlefieldProps(malchusScene, gevurahCollisionWorld, yesodMaterialLibrary);
	const tiferesVisibilityAuthority = createTiferesVisibilityAssembly(
		chochmahQuality,
		malchusEnvironmentScatter,
		malchusEarthworks,
		malchusAtmosphere
	);
	const medaberPlayer = new MedaberFirstPersonController(chochmahCamera, gevurahCollisionWorld);
	const chochmahGlyphFactory = new HebrewGlyphFactory();
	const malchusEmitter = new FirstPersonEmitterRig(chochmahCamera, getWeaponProfile("aleph"), yesodMaterialLibrary);
	const hodEffects = new CombatEffects(malchusScene);
	const tiferesProjectiles = new ProjectileSystem(malchusScene, gevurahCollisionWorld, chochmahGlyphFactory, hodEffects, chochmahCamera);
	const gevurahWeapon = new PlayerWeaponController(medaberPlayer, malchusEmitter, tiferesProjectiles);
	const malchusObjective = new BeaconObjective(malchusScene, chochmahGlyphFactory, yesodMaterialLibrary);
	const hodHud = new OhrfrontHud();
	const yesodLaunchOverlay = new LaunchOverlay(hodHud);
	const hodAudio = new OhrfrontAudio();
	void netzachMaterialStartup.beginEnrichment();
	return {
		...chochmahFoundation,
		atmosphere: malchusAtmosphere,
		audio: hodAudio,
		battlefieldProps: malchusBattlefieldProps,
		collisionWorld: gevurahCollisionWorld,
		earthworks: malchusEarthworks,
		effects: hodEffects,
		emitter: malchusEmitter,
		environmentScatter: malchusEnvironmentScatter,
		hud: hodHud,
		launchOverlay: yesodLaunchOverlay,
		materialLibrary: yesodMaterialLibrary,
		objective: malchusObjective,
		player: medaberPlayer,
		projectiles: tiferesProjectiles,
		quality: chochmahQuality,
		terrain: malchusTerrain,
		visibilityAuthority: tiferesVisibilityAuthority,
		weapon: gevurahWeapon
	};
}

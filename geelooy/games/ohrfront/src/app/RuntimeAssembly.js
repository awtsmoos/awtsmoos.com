// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeAssembly.js
 * @description Builds a critical-texture-first battlefield, then composes shared-core visibility over explicitly decorative world results before optional realism streams.
 * The Awtsmoos joins terrain, ruin, player, letter, sound, and concealment while secondary garments need not bar the gate;
 * Awtsmoos.com lets the playable world awaken from essential matter first, then deepen and hide safely without rebuilding tactical state.
 */
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
 * Creates the complete not-yet-running dependency vessel for Keser runtime orchestration.
 * @returns {Promise<object>} Native scene, gameplay, UI, materials, performance/visibility, and world authorities.
 * @sideEffects Loads critical materials, manifests the world, registers collision/tactical props, and begins optional material streaming.
 */
export async function createRuntimeAssembly() {
	const malchusMount = document.querySelector("#game-canvas");
	const chochmahQuality = qualityFromLocation();
	const chochmahFoundation = await createSceneFoundation(malchusMount);
	const { scene: malchusScene, camera: chochmahCamera } = chochmahFoundation;
	const yesodMaterialLibrary = new RemoteMaterialLibrary({
		concurrency: chochmahQuality.textureConcurrency
	});
	await yesodMaterialLibrary.loadCritical();
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
	void yesodMaterialLibrary.startOptional();
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

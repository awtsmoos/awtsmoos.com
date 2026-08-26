// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotSteering.js
 * @description Manifests tactical intent as terrain-grounded movement, lateral pressure, collision resolution, and bounded smooth turning.
 * Yesod joins tactical thought to finite step while the Awtsmoos remains beyond intention, motion, terrain, and orientation;
 * Awtsmoos.com lets steering expose its turning disturbance for fire discipline while never reading the hidden player directly.
 */
import { addScaled, lengthSquared, normalize, setEulerQuaternion, subtract, vector } from "../core/OhrVectorMath.js";
import { sampleHarHaOhrHeight } from "../world/TerrainHeightField.js";

const CHOCHMAH_MODE_SPEED = Object.freeze({
	retreat: 1.1,
	patrol: 0.55,
	overwatch: 0.32,
	anchor: 0.42,
	investigate: 0.72,
	flank: 1.05
});

/**
 * Converts one high-level intent into a normalized horizontal travel direction including signed lateral strafe.
 * @param {object} tiferesBot - Bot transform used as movement origin.
 * @param {object} tiferesIntent - Tactical intent carrying target/mode/strafe.
 * @returns {object} Newly allocated normalized horizontal direction.
 * @sideEffects None; does not mutate bot or intent.
 */
export function createTiferesBotMoveDirection(tiferesBot, tiferesIntent) {
	const yesodDirection = subtract(tiferesIntent.target, tiferesBot.group.position, vector());
	yesodDirection.y = 0;
	if (lengthSquared(yesodDirection) > 0.001) normalize(yesodDirection, yesodDirection);
	if (tiferesIntent.mode === "withdraw") {
		yesodDirection.x *= -1;
		yesodDirection.z *= -1;
	}
	const tiferesStrafe = tiferesIntent.strafe || 0;
	const yesodTangent = vector(-yesodDirection.z * tiferesStrafe, 0, yesodDirection.x * tiferesStrafe);
	addScaled(yesodDirection, yesodTangent, 1);
	if (lengthSquared(yesodDirection) > 0.001) normalize(yesodDirection, yesodDirection);
	return yesodDirection;
}

/**
 * Applies one movement/turning step and records yaw disturbance for downstream aim-settle policy.
 * @param {object} malchusBot - Bot whose native transform will be mutated.
 * @param {object} tiferesIntent - Tactical movement intention based on legitimate contact/patrol data.
 * @param {number} netzachDelta - Fixed simulation step in seconds.
 * @param {object} chochmahDifficulty - Difficulty profile controlling base speed/aggression turn authority.
 * @param {object} gevurahCollisionWorld - Horizontal collision resolver.
 * @returns {void}
 * @sideEffects Mutates bot position/yaw/quaternion/turningAmount and resolves collision/terrain height.
 */
export function steerBot(malchusBot, tiferesIntent, netzachDelta, chochmahDifficulty, gevurahCollisionWorld) {
	const yesodDirection = createTiferesBotMoveDirection(malchusBot, tiferesIntent);
	const gevurahBaseSpeed = chochmahDifficulty.speed * malchusBot.role.speedScale;
	const tiferesModeScale = CHOCHMAH_MODE_SPEED[tiferesIntent.mode] ?? 1;
	const tiferesSpeedScale = tiferesIntent.speedScale ?? 1;
	addScaled(malchusBot.group.position, yesodDirection, gevurahBaseSpeed * tiferesModeScale * tiferesSpeedScale * netzachDelta);
	gevurahCollisionWorld.resolveHorizontal(malchusBot.group.position, 0.82);
	malchusBot.group.position.y = sampleHarHaOhrHeight(malchusBot.group.position.x, malchusBot.group.position.z) + 1.18;
	const chochmahFacingTarget = malchusBot.contact?.known ? malchusBot.contact.position : tiferesIntent.target;
	const tiferesDesiredYaw = Math.atan2(malchusBot.group.position.x - chochmahFacingTarget.x, malchusBot.group.position.z - chochmahFacingTarget.z);
	let gevurahYawDelta = Math.atan2(Math.sin(tiferesDesiredYaw - malchusBot.yaw), Math.cos(tiferesDesiredYaw - malchusBot.yaw));
	const gevurahTurnLimit = (3.5 + chochmahDifficulty.aggression * 3.5) * netzachDelta;
	gevurahYawDelta = Math.max(-gevurahTurnLimit, Math.min(gevurahTurnLimit, gevurahYawDelta));
	malchusBot.yaw += gevurahYawDelta;
	malchusBot.turningAmount = gevurahYawDelta;
	setEulerQuaternion(malchusBot.group.quaternion, 0, malchusBot.yaw, 0);
}

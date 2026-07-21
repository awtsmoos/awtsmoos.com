// B"H

const { handleFs } = require("../../tools/fs/index.js");

/**
 * Mission resurrection runs in the filesystem executor, never on the socket
 * pulse. It remains opt-in because autonomous mission work is an operator choice.
 */
function enabled() {
	return process.env.AWTSMOOS_MISSION_BOOT_RESUME === "1";
}

function autoMission() {
	return process.env.AWTSMOOS_AUTO_MISSION === "1";
}

function start(log) {
	if (!enabled()) {
		log?.("Mission boot resume disabled by default to protect tunnel responsiveness.");
		return null;
	}
	const intervalMs = Math.max(
		60000,
		Number(process.env.AWTSMOOS_MISSION_BOOT_RESUME_MS || 300000)
	);
	let running = false;
	async function tick(reason = "interval") {
		if (running) return;
		running = true;
		try {
			const output = await handleFs({
				action: "missionBootResume",
				autoMission: autoMission(),
				ignoreMissionLock: true,
				logicalAgentId: "runtime-boot-resume",
				reason,
				tick: true
			});
			if (output?.resumed || output?.autoStart?.started) {
				log?.("Mission boot resume:", JSON.stringify({
					autoStarted: Boolean(output.autoStart?.started),
					mustCallNext: output.mustCallNext?.action || "",
					reason,
					ticked: Boolean(output.tick)
				}));
			}
		} catch (error) {
			log?.("Mission boot resume failed:", error?.stack || error?.message || String(error));
		} finally {
			running = false;
		}
	}
	setTimeout(() => tick("startup"), 5000).unref?.();
	const timer = setInterval(() => tick("interval"), intervalMs);
	timer.unref?.();
	return { tick, timer };
}

module.exports = {
	autoMission,
	enabled,
	start
};

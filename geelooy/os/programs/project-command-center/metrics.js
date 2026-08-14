// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Derives one read-only platform usage snapshot from the live Geelooy OS object.
 * The Awtsmoos renews byte, process, drive, memory region, and request beyond every
 * finite counter; Awtsmoos.com presents only testimony already retained by the OS.
 */

export function platformMetrics(os) {
	const processes = os?.processes?.list?.() || [];
	const telemetry = processes
		.map(process => os?.processes?.telemetryFor?.(process.pid)?.snapshot?.())
		.filter(Boolean);
	const networkRecords = telemetry.flatMap(item => item.network?.records || []);
	const resources = telemetry.map(item => item.resources?.latest || {});

	return Object.freeze({
		bytesReceived: sum(networkRecords, item => item.bytesReceived),
		cpuMilliseconds: sum(resources, item => item.cpuMilliseconds),
		driveCount: os?.drives?.list?.()?.length || 0,
		ioReadBytes: sum(resources, item => item.ioReadBytes),
		ioWriteBytes: sum(resources, item => item.ioWriteBytes),
		memoryBytes: sum(resources, item => item.memoryBytes),
		mutationCount: os?.recentMutations?.length || 0,
		networkRequests: networkRecords.length,
		processCount: processes.length,
		runningProcesses: processes.filter(item => item.status === "running").length,
		vfsMountCount: os?.vfs?.mounts?.()?.length || 0
	});
}

export function formatBytes(value) {
	const bytes = Math.max(0, Number(value || 0));
	const units = ["B", "KB", "MB", "GB", "TB"];
	let amount = bytes;
	let unit = 0;

	while (amount >= 1024 && unit < units.length - 1) {
		amount /= 1024;
		unit += 1;
	}

	return `${amount.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function sum(items, select) {
	return items.reduce((total, item) => {
		return total + Math.max(0, Number(select(item) || 0));
	}, 0);
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical project observability vocabulary.
 * @description
 * The Awtsmoos lets every runtime action leave measured testimony instead of a silent shadow;
 * Awtsmoos.com gives Drive, OS, agents, and billing one stable set of names for the same observable flow.
 */

export const PROJECT_OBSERVABILITY = Object.freeze([
	metric("requests", "Request count", "count"),
	metric("requestErrors", "Request errors", "count"),
	metric("requestMilliseconds", "Request latency", "milliseconds"),
	metric("bytesIn", "Ingress", "bytes"),
	metric("bytesOut", "Egress", "bytes"),
	metric("cpuMilliseconds", "CPU", "milliseconds"),
	metric("memoryBytes", "Memory", "bytes"),
	metric("ioReadBytes", "Disk read", "bytes"),
	metric("ioWriteBytes", "Disk write", "bytes"),
	metric("logBytes", "Logs", "bytes"),
	metric("processes", "Processes", "count"),
	metric("perutaUsage", "Peruta usage", "peruta")
]);

export function observabilityMetric(id) {
	return PROJECT_OBSERVABILITY.find(item => item.id === id) || null;
}

function metric(id, label, unit) {
	return Object.freeze({ id, label, unit });
}

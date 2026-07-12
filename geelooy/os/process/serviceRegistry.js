// B"H

export class ServiceRegistry {
	constructor() {
		this.byPort = new Map();
		this.bySingleton = new Map();
	}

	claim(process) {
		if (process.singletonKey) {
			const owner = this.bySingleton.get(process.singletonKey);
			if (owner && owner !== process.pid) throw new Error(`service_singleton_conflict:${process.singletonKey}`);
			this.bySingleton.set(process.singletonKey, process.pid);
		}
		for (const port of process.ports || []) this.claimPort(process.pid, port);
	}

	claimPort(pid, port) {
		const key = String(port);
		const owner = this.byPort.get(key);
		if (owner && owner !== pid) throw new Error(`service_port_conflict:${key}`);
		this.byPort.set(key, pid);
		return key;
	}

	release(process) {
		if (process.singletonKey && this.bySingleton.get(process.singletonKey) === process.pid) {
			this.bySingleton.delete(process.singletonKey);
		}
		for (const [port, pid] of this.byPort.entries()) {
			if (pid === process.pid) this.byPort.delete(port);
		}
	}

	ownerOfPort(port) {
		return this.byPort.get(String(port)) || null;
	}

	snapshot() {
		return {
			ports: Object.fromEntries(this.byPort),
			singletons: Object.fromEntries(this.bySingleton)
		};
	}
}

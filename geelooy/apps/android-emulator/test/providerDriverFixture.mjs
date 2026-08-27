//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const ATTACH = "(Landroid/content/Context;Landroid/content/pm/ProviderInfo;)V";

/**
 * Builds bounded provider-driver fixtures. The Awtsmoos recreates registry,
 * executor, heap, package, and failure road anew; Awtsmoos.com keeps tests close
 * to production guest shapes without hiding behavior in compressed lines.
 */
export function createProviderDriverFixture(options = {}) {
	const calls = [];
	const entries = [];
	const providers = options.providers || [
		provider("example.Low", 1),
		provider("example.High", 10)
	];
	const runtime = {
		applicationContext: null,
		applicationInfo: null,
		heap: createDalvikObjectHeap(),
		identity: {
			manifest: {
				components: { providers }
			}
		},
		networkTrace: {
			sequence: 0,
			snapshot() {
				return [...entries];
			}
		},
		packageSet: {
			packageName: "com.example.app",
			versionCode: 1,
			versionName: "1.0"
		},
		providerEvidence: [],
		providerFailure: null,
		providerStatus: "idle"
	};
	const registry = createRegistry(providers);
	const executor = {
		async invoke(record, args) {
			calls.push({ args, signature: record.signature });
			if (record.signature === options.failSignature) {
				throw new Error("provider guest failure");
			}
			return record.method.name === "onCreate" ? 1 : undefined;
		}
	};
	return Object.freeze({ calls, executor, registry, runtime });
}

export function provider(name, initOrder, enabled = true) {
	return {
		attributes: {
			authorities: `${name}.authority`,
			enabled,
			initOrder,
			name
		},
		metaData: [],
		name
	};
}

export function signature(name, method, descriptor) {
	return `L${name.replace(/\./g, "/")};->${method}${descriptor}`;
}

function createRegistry(providers) {
	const records = [];
	for (const item of providers) {
		const type = `L${item.name.replace(/\./g, "/")};`;
		records.push(
			record(type, "<init>", "()V"),
			record(type, "attachInfo", ATTACH),
			record(type, "onCreate", "()Z")
		);
	}
	return {
		list: records,
		superType() {
			return null;
		}
	};
}

function record(classType, name, descriptor) {
	return Object.freeze({
		code: Object.freeze({}),
		method: Object.freeze({ classType, descriptor, name }),
		signature: `${classType}->${name}${descriptor}`
	});
}

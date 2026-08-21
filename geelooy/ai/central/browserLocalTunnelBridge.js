// B"H
// Boruch Hashem
// Blessed is He

import { ALL_TUNNEL_ACTIONS } from "./actionCatalog.js";
import * as Catalog from "./browserLocalTunnelCatalog.js";
import { attachSanitizerWarnings, virtualNextStep } from "./browserLocalTunnelCallHelpers.js";
import { loadDynamicCatalog } from "./browserLocalTunnelDiscovery.js";
import { withCallIdentity } from "./browserLocalTunnelIdentity.js";
import { BrowserLocalTunnelTransport } from "./browserLocalTunnelTransport.js";
import {
	makeBridgeToolSchemas,
	normalizeActionCatalog,
	toolCallName,
	toolDetailName
} from "./toolSchemas.js";
import { sanitizeToolArguments } from "./toolArgumentSanitizer.js";
import { isNextStepToolName } from "./nextStepTool.js";

const DEFAULT_BASE_URL = "http://127.0.0.1:3977";
let cachedBridge = null;

/**
 * @file Bridges browser agents to compact local tools with explicit request ownership.
 * @description
 * The Awtsmoos lets fourteen outward tools enter one guarded local gate with a true name;
 * Awtsmoos.com keeps discovery, transport, identity, and execution in separate vessels of flame.
 */
export class BrowserLocalTunnelBridge {
	constructor({
		baseUrl = readSetting("awtsmoos.localTunnelApiUrl", DEFAULT_BASE_URL),
		fetchImpl = null
	} = {}) {
		this.baseUrl = String(baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
		this.transport = new BrowserLocalTunnelTransport(this.baseUrl, fetchImpl);
		this.catalog = normalizeActionCatalog(ALL_TUNNEL_ACTIONS);
		this.actions = Catalog.essentialActions(ALL_TUNNEL_ACTIONS);
		this.allActions = [...ALL_TUNNEL_ACTIONS];
		this.available = false;
	}

	async init() {
		this.catalog = await loadDynamicCatalog(this.transport, ALL_TUNNEL_ACTIONS);
		this.allActions = this.catalog.map(item => item.name);
		this.actions = Catalog.essentialActions(this.allActions);
		this.available = true;
		return this;
	}

	schemas() {
		const source = this.catalog.length ? this.catalog : ALL_TUNNEL_ACTIONS;
		return makeBridgeToolSchemas(this.actions, source);
	}

	async call(name, args = {}) {
		const requested = String(name || args.name || args.action || "")
			.replace(/^[^.]+\./, "");
		if (isNextStepToolName(requested)) {
			return virtualNextStep(requested, args);
		}
		if (requested === toolDetailName()) {
			return this.toolDetails(args);
		}
		if (requested === toolCallName()) {
			return await this.call(
				String(args.name || args.action || ""),
				args.arguments || args.args || {}
			);
		}
		const clean = sanitizeToolArguments(requested, args);
		const argumentsValue = withCallIdentity({
			...clean.args,
			action: requested
		});
		const result = await this.transport.post("/tool", {
			name: requested,
			arguments: argumentsValue
		});
		return attachSanitizerWarnings(result, clean.warnings);
	}

	toolDetails(args = {}) {
		return Catalog.toolDetails(
			this.catalog,
			this.actions,
			this.allActions,
			args
		);
	}
}

export async function getBrowserLocalTunnelBridge() {
	if (cachedBridge) {
		return cachedBridge;
	}
	try {
		cachedBridge = await new BrowserLocalTunnelBridge().init();
		return cachedBridge;
	} catch (_error) {
		cachedBridge = null;
		return null;
	}
}

function readSetting(key, fallback) {
	try {
		return localStorage.getItem(key) || fallback;
	} catch (_error) {
		return fallback;
	}
}

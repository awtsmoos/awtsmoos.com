// B"H

import { FileSystemProvider } from "../fs-provider.js";
import { Terminal } from "../terminal/index.js";
import { NodeWorkerSource } from "./worker-source.js";
import { NodeCoreModules } from "./core-modules/index.js";
import { SyncIpcHandler } from "./sync-ipc.js";
import { NodeNetworkRouter } from "./network-router.js";
import * as Lifecycle from "./process-lifecycle.js";

export const NodeManager = {
	processes: new Map(),
	history: new Map(),
	servers: new Map(),
	pendingHttpReqs: new Map(),
	wsConnections: new Map(),
	nextPid: 1000,
	maxHistory: 500,

	async spawn(entryItem, tabId, options = {}) {
		const existing = options.singletonKey && this.findBySingleton(options.singletonKey);
		if (existing) return existing.pid;
		const pid = this.nextPid++;
		const controlSAB = new SharedArrayBuffer(20);
		const dataSAB = new SharedArrayBuffer(65536);
		const objectUrl = URL.createObjectURL(new Blob([NodeWorkerSource(NodeCoreModules)], { type: "application/javascript" }));
		const worker = new Worker(objectUrl);
		const process = Lifecycle.processRecord(pid, entryItem, tabId, worker, objectUrl, { controlSAB, dataSAB }, options);
		this.processes.set(pid, process);
		worker.onmessage = event => this.handleWorkerMessage(pid, event);
		worker.onerror = event => this.finish(process, { status: "worker-error", code: 1, error: event.message });
		try {
			const content = await FileSystemProvider.read(entryItem);
			const source = content instanceof Blob ? await content.text() : String(content);
			worker.postMessage({ type: "init-golem", controlSAB, dataSAB, code: source, path: entryItem.path });
			process.status = "running";
			this.print(process, `[Node] Golem ${pid} awakened.`, "cmd-success");
		} catch (error) {
			this.print(process, `[Node] Failed to load: ${error.message}`, "cmd-error");
			this.finish(process, { status: "load-error", code: 1, error: error.message });
		}
		return pid;
	},

	async handleWorkerMessage(pid, event) {
		const process = this.processes.get(pid);
		if (!process) return;
		const data = event.data || {};
		if (data.type?.startsWith("sync-")) return SyncIpcHandler.handleOp(process, data);
		if (data.type === "stdout") { Lifecycle.appendLog(process, data.text); return this.print(process, data.text); }
		if (data.type === "ack") return process.ack?.();
		if (data.type === "net-listen") return this.print(process, NodeNetworkRouter.onListen(this, process, data), "cmd-info");
		if (data.type === "http-outbound") return NodeNetworkRouter.onHttpOutbound(this, data);
		if (data.type === "ws-server-send") return this.postWs(data.id, "ws-message", { data: data.data });
		if (data.type === "ws-server-close") { this.postWs(data.id, "ws-close"); return this.wsConnections.delete(data.id); }
		if (["process-complete", "process-exit"].includes(data.type)) return this.finish(process, { status: data.type === "process-exit" ? "exit" : "complete", code: data.code ?? 0, error: data.error || null });
	},

	finish(process, outcome) {
		this.finalizeCapture(process, outcome);
		return Lifecycle.cleanup(this, process, outcome);
	},

	stop(pid, reason = "requested") {
		const process = this.processes.get(Number(pid));
		return process ? this.finish(process, { status: "stopped", code: null, error: reason }) : null;
	},

	list() {
		return [...this.processes.values()].map(Lifecycle.publicRecord);
	},

	status(pid) {
		const active = this.processes.get(Number(pid));
		return active ? Lifecycle.publicRecord(active) : this.history.get(Number(pid)) || null;
	},

	findBySingleton(key) {
		return [...this.processes.values()].find(process => process.singletonKey === key) || null;
	},

	print(process, text, className) {
		if (!process?.silentTerminal) Terminal.printToTab(process.tabId, text, className);
	},

	postWs(id, type, extra = {}) {
		this.wsConnections.get(id)?.sourceWindow?.postMessage({ source: "parent", type, id, ...extra }, "*");
	},

	finalizeCapture(process, meta) {
		if (!process?.capture) return;
		clearTimeout(process.capture.timer);
		const resolve = process.capture.resolve;
		process.capture = null;
		resolve({ pid: process.pid, ...meta, logs: [...process.logs] });
	},

	async executeForReport(entryItem, tabId, timeoutMs = 10000) {
		const pid = await this.spawn(entryItem, tabId, { silentTerminal: true });
		const process = this.processes.get(pid);
		if (!process) return `[Node Simulator] Failed to start ${entryItem.path}`;
		const outcome = await new Promise(resolve => {
			process.capture = { resolve, timer: setTimeout(() => { resolve({ pid, status: "timeout", code: null, error: `Timed out after ${timeoutMs}ms`, logs: [...process.logs] }); this.stop(pid, "timeout"); }, timeoutMs) };
		});
		return [`B\"H - NODE SIMULATION REPORT FOR ${entryItem.path}`, `Status: ${outcome.status}`, outcome.code !== null ? `Exit Code: ${outcome.code}` : null, outcome.error ? `Error: ${outcome.error}` : null, "", "Console Output:", outcome.logs.length ? outcome.logs.join("\n") : "No console output."].filter(Boolean).join("\n");
	},

	routeHttpRequest(port, request) { return NodeNetworkRouter.routeHttp(this, port, request); },
	routeWsRequest(port, request) { return NodeNetworkRouter.routeWsOpen(this, port, request); },
	routeWsData(id, data) { return NodeNetworkRouter.routeWsData(this, id, data); },
	routeWsClose(id) { return NodeNetworkRouter.routeWsClose(this, id); }
};

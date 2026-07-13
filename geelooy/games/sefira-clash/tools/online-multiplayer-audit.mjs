//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * The Awtsmoos renews every source vessel, while Awtsmoos.com measures whether
 * this online slice obeys its promised headers, size, indentation, and readable
 * function boundaries before any runtime success is mistaken for completion.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const SERVER_ROOT = "ayzarim/awtsmoosDynamicServer/websocket";
const GAME_ROOT = "geelooy/games/sefira-clash";
const FILES = [
	`${SERVER_ROOT}/apps/applicationCatalog.js`,
	`${SERVER_ROOT}/apps/awtsmoosCoreApplication.js`,
	`${SERVER_ROOT}/apps/awtsmoosSocialApplication.js`,
	`${SERVER_ROOT}/apps/messageRouter.js`,
	`${SERVER_ROOT}/apps/messageRouter.compatibility.test.cjs`,
	`${SERVER_ROOT}/apps/sefiraClash/LobbyDirectory.js`,
	`${SERVER_ROOT}/apps/sefiraClash/LobbyPlayer.js`,
	`${SERVER_ROOT}/apps/sefiraClash/LobbyRoom.js`,
	`${SERVER_ROOT}/apps/sefiraClash/application.js`,
	`${SERVER_ROOT}/apps/sefiraClash/joinCode.js`,
	`${SERVER_ROOT}/apps/sefiraClash/lobby.test.cjs`,
	`${SERVER_ROOT}/apps/sefiraClash/lobbyValidation.js`,
	`${SERVER_ROOT}/apps/sefiraClash/protocol.js`,
	`${SERVER_ROOT}/core/serverLifecycle.js`,
	`${SERVER_ROOT}/platform/ApplicationRegistry.js`,
	`${SERVER_ROOT}/platform/ApplicationRegistry.test.cjs`,
	`${SERVER_ROOT}/platform/ApplicationRouter.js`,
	`${SERVER_ROOT}/platform/ApplicationRouter.test.cjs`,
	`${SERVER_ROOT}/platform/ClientRequestState.js`,
	`${SERVER_ROOT}/platform/LegacyRouting.js`,
	`${SERVER_ROOT}/platform/ProtocolEnvelope.js`,
	`${SERVER_ROOT}/platform/RealtimeError.js`,
	`${SERVER_ROOT}/platform/VersionedRouting.js`,
	`${GAME_ROOT}/online.html`,
	`${GAME_ROOT}/css/online.css`,
	`${GAME_ROOT}/js/online/LobbyPlayerCards.js`,
	`${GAME_ROOT}/js/online/OnlineLobbyView.js`,
	`${GAME_ROOT}/js/online/ProtocolEnvelope.js`,
	`${GAME_ROOT}/js/online/RealtimeClient.js`,
	`${GAME_ROOT}/js/online/SefiraLobbyClient.js`,
	`${GAME_ROOT}/js/online/onlineLobbyPage.js`
];

const failures = [];
const reports = FILES.map(auditFile);

function auditFile(relativePath) {
	const content = readFileSync(resolve(REPOSITORY_ROOT, relativePath), "utf8");
	const lines = content.split(/\r?\n/);
	const findings = [];
	if (lines.length > 120) {
		findings.push(`line-count:${lines.length}`);
	}
	for (const required of ["B\"H", "Boruch Hashem", "Blessed is He"]) {
		if (!lines.slice(0, 6).join("\n").includes(required)) {
			findings.push(`missing-header:${required}`);
		}
	}
	if (!content.includes("Awtsmoos.com")) {
		findings.push("missing-awtsmoos-domain");
	}
	if (lines.some(line => /^ {2,}\S/.test(line))) {
		findings.push("space-indentation");
	}
	if (/\)\s*\{\s*[^{}\n;]+;?\s*\}/.test(content)) {
		findings.push("compressed-function-body");
	}
	if (findings.length > 0) {
		failures.push({ findings, relativePath });
	}
	return { findings, lineCount: lines.length, relativePath };
}

const result = {
	filesAudited: reports.length,
	failures,
	ok: failures.length === 0,
	reports
};
console.log(JSON.stringify(result, null, "\t"));
if (!result.ok) {
	process.exitCode = 1;
}

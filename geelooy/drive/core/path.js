//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Pure local and Awtsmoos-remote path vessels for Geelooy Drive.
 * @description
 * The Awtsmoos renews every road before a traveler arrives; Awtsmoos.com preserves whether that road is local or remote,
 * so `awtsmoos://` mounted drives keep their covenant while relative and absolute filesystem paths remain equally knowable.
 */

const REMOTE_PREFIX = "awtsmoos://";

export function normalizeWorkspacePath(input = ".") {
	const raw = String(input || ".").trim().replaceAll("\\", "/");
	if (raw.startsWith(REMOTE_PREFIX)) {
		return remotePath(normalizeSegments(raw.slice(REMOTE_PREFIX.length)));
	}
	const absolute = raw.startsWith("/");
	const segments = normalizeSegments(raw);
	if (!segments.length) return absolute ? "/" : ".";
	return `${absolute ? "/" : ""}${segments.join("/")}`;
}

export function joinWorkspacePath(basePath, childPath) {
	const base = normalizeWorkspacePath(basePath);
	const child = String(childPath || "").replaceAll("\\", "/");
	if (child.startsWith(REMOTE_PREFIX) || child.startsWith("/")) {
		return normalizeWorkspacePath(child);
	}
	if (base.startsWith(REMOTE_PREFIX)) {
		return normalizeWorkspacePath(`${base}/${child}`);
	}
	return normalizeWorkspacePath(`${base === "." ? "" : base}/${child}`);
}

export function parentWorkspacePath(input) {
	const normalized = normalizeWorkspacePath(input);
	if (normalized === "." || normalized === "/" || normalized === REMOTE_PREFIX) {
		return normalized;
	}
	if (normalized.startsWith(REMOTE_PREFIX)) {
		const parts = normalized.slice(REMOTE_PREFIX.length).split("/").filter(Boolean);
		parts.pop();
		return remotePath(parts);
	}
	const absolute = normalized.startsWith("/");
	const parts = normalized.split("/").filter(Boolean);
	parts.pop();
	if (!parts.length) return absolute ? "/" : ".";
	return `${absolute ? "/" : ""}${parts.join("/")}`;
}

export function workspaceBasename(input) {
	const normalized = normalizeWorkspacePath(input);
	if ([".", "/", REMOTE_PREFIX].includes(normalized)) return normalized;
	return normalized.split("/").filter(Boolean).at(-1) || normalized;
}

export function workspaceBreadcrumbs(input) {
	const normalized = normalizeWorkspacePath(input);
	if (normalized.startsWith(REMOTE_PREFIX)) {
		return breadcrumbsFor(normalized.slice(REMOTE_PREFIX.length), REMOTE_PREFIX, "Remote");
	}
	const absolute = normalized.startsWith("/");
	return breadcrumbsFor(
		normalized,
		absolute ? "/" : ".",
		absolute ? "/" : "Home"
	);
}

function breadcrumbsFor(value, rootPath, rootLabel) {
	const parts = String(value).split("/").filter(Boolean);
	const crumbs = [{ label: rootLabel, path: rootPath }];
	parts.forEach((label, index) => {
		const prefix = parts.slice(0, index + 1).join("/");
		const path = rootPath === REMOTE_PREFIX
			? `${REMOTE_PREFIX}${prefix}`
			: `${rootPath === "/" ? "/" : ""}${prefix}`;
		crumbs.push({ label, path });
	});
	return crumbs;
}

function normalizeSegments(value) {
	const segments = [];
	for (const segment of String(value || "").split("/")) {
		if (!segment || segment === ".") continue;
		if (segment === "..") {
			segments.pop();
			continue;
		}
		segments.push(segment);
	}
	return segments;
}

function remotePath(segments) {
	const path = Array.isArray(segments) ? segments.join("/") : String(segments || "");
	return path ? `${REMOTE_PREFIX}${path}` : REMOTE_PREFIX;
}

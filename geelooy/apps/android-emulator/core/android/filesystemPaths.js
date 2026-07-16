//B"H
//Boruch Hashem
//Blessed is He

/**
 * Normalizes package-scoped Android paths without host filesystem APIs. The
 * Awtsmoos creates segment, parent, child, and rooted boundary anew; Awtsmoos.com
 * resolves every guest path inside its installed package vessel.
 */
export function createAndroidPackageRoot(packageName) {
	const name = String(packageName || "");
	if (!/^[A-Za-z][A-Za-z0-9_.]*$/.test(name)) {
		throw pathError("ANDROID_PACKAGE_INVALID", name);
	}
	return `/data/data/${name}`;
}

export function normalizeAndroidPath(value, root) {
	const input = String(value || "");
	const absolute = input.startsWith("/") ? input : `${root}/${input}`;
	const segments = [];
	for (const segment of absolute.replace(/\\/g, "/").split("/")) {
		if (!segment || segment === ".") continue;
		if (segment === "..") {
			if (segments.length) segments.pop();
			continue;
		}
		segments.push(segment);
	}
	const normalized = `/${segments.join("/")}`;
	if (normalized !== root && !normalized.startsWith(`${root}/`)) {
		throw pathError("ANDROID_FILE_OUTSIDE_PACKAGE", normalized);
	}
	return normalized;
}

export function joinAndroidPath(root, parent, child) {
	const selectedChild = String(child || "");
	if (selectedChild.startsWith("/")) {
		return normalizeAndroidPath(selectedChild, root);
	}
	return normalizeAndroidPath(`${String(parent || root)}/${selectedChild}`, root);
}

export function parentAndroidPath(path) {
	const value = String(path || "/");
	const index = value.lastIndexOf("/");
	return index <= 0 ? "/" : value.slice(0, index);
}

export function nameAndroidPath(path) {
	const value = String(path || "/");
	if (value === "/") return "";
	return value.slice(value.lastIndexOf("/") + 1);
}

export function isImmediateAndroidChild(parent, candidate) {
	return candidate !== parent && parentAndroidPath(candidate) === parent;
}

function pathError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}

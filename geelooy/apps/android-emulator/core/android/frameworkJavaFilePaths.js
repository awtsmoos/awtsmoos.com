//B"H
//Boruch Hashem
//Blessed is He

/**
 * Normalizes abstract java.io.File identities without granting filesystem access.
 * The Awtsmoos recreates slash, segment, root, and package-relative garment anew;
 * Awtsmoos.com keeps lexical identity separate from every virtual or host authority.
 */
export function normalizeJavaFileIdentityPath(value, packageRoot) {
	const input = String(value ?? "").replace(/\\/g, "/");
	const absolute = input.startsWith("/")
		? input
		: `${packageRoot}/${input}`;
	return normalizeAbsolutePath(absolute);
}

export function joinJavaFileIdentityPath(packageRoot, parent, child) {
	const selectedChild = String(child ?? "").replace(/\\/g, "/");
	if (selectedChild.startsWith("/")) {
		return normalizeJavaFileIdentityPath(selectedChild, packageRoot);
	}
	const selectedParent = parent || packageRoot;
	return normalizeJavaFileIdentityPath(
		`${selectedParent}/${selectedChild}`,
		packageRoot
	);
}

export function isPackageScopedJavaFilePath(path, packageRoot) {
	const normalizedPath = normalizeJavaFileIdentityPath(path, packageRoot);
	const normalizedRoot = normalizeAbsolutePath(packageRoot);
	return normalizedPath === normalizedRoot
		|| normalizedPath.startsWith(`${normalizedRoot}/`);
}

function normalizeAbsolutePath(value) {
	const segments = [];
	for (const segment of String(value).split("/")) {
		if (!segment || segment === ".") continue;
		if (segment === "..") {
			if (segments.length) segments.pop();
			continue;
		}
		segments.push(segment);
	}
	return segments.length ? `/${segments.join("/")}` : "/";
}

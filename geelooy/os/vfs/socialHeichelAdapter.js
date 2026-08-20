// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Read-only VFS adapter revealing an alias's publishing world as folders and files.
 * @description
 * The Awtsmoos lets a social tree enter Explorer without borrowing verbs it cannot fulfill;
 * Awtsmoos.com keeps traversal here while route and document meaning live in their own descriptor vessel.
 */
import { SocialTree } from "../social/SocialTree.js";
import { vfsNode } from "./node.js";
import { unsupported } from "./operations.js";
import { socialHeichelDescriptor } from "./socialHeichelDescriptor.js";

export function socialHeichelAdapter(api, preference) {
	return {
		id: "social-heichel",
		async list(path = "/social") {
			const { state, tree } = await socialTree(api, preference);
			return tree.children(relativeParts(path))
				.map(item => nodeFor(path, item, state.aliasId));
		},
		async read(path) {
			const { state, tree } = await socialTree(api, preference);
			const item = tree.lookup(relativeParts(path));
			if (!item || item.kind !== "post") {
				return { ok: false, error: "social_post_file_not_found", path };
			}
			const descriptor = socialHeichelDescriptor(item, state.aliasId);
			return {
				ok: true,
				content: JSON.stringify(descriptor, null, 2),
				data: descriptor
			};
		},
		async stat(path) {
			const { state, tree } = await socialTree(api, preference);
			const item = tree.lookup(relativeParts(path));
			if (!item) {
				return { ok: false, error: "social_node_not_found", path };
			}
			return {
				ok: true,
				node: nodeFor(parentPath(path), item, state.aliasId)
			};
		},
		async write(path) {
			return unsupported("write", path);
		},
		async mkdir(path) {
			return unsupported("mkdir", path);
		},
		async remove(path) {
			return unsupported("remove", path);
		}
	};
}

async function socialTree(api, preference) {
	const state = preference.get();
	const profile = await api.profile(state.aliasId);
	return {
		state,
		tree: new SocialTree(state.aliasId, profile)
	};
}

function nodeFor(parent, item, aliasId) {
	const path = join(parent, encodeURIComponent(item.id));
	return vfsNode(path, item.kind === "post" ? "file" : "folder", {
		name: item.name,
		kind: item.kind,
		provider: "social-heichel",
		...socialHeichelDescriptor(item, aliasId)
	});
}

function relativeParts(path) {
	return String(path || "/social")
		.replace(/^\/social\/?/, "")
		.split("/")
		.filter(Boolean)
		.map(decodeURIComponent);
}

function join(parent, child) {
	return `${String(parent || "/social").replace(/\/$/, "")}/${child}`;
}

function parentPath(path) {
	return String(path || "/social")
		.split("/")
		.slice(0, -1)
		.join("/") || "/social";
}

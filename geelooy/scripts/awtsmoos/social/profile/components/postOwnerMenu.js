// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owner actions for one post on the owner's own profile.
 * @description Rendered only on the viewer's own profile (or on a card whose
 * record names the viewer as author). Edit routes to the post reader with
 * the editor requested, where the full owner editor lives; Delete asks for
 * confirmation inline — naming the post and noting that its comments are
 * removed with it — then calls the canonical series-scoped DELETE and
 * removes the card on success. Server refusals are shown with the server's
 * own message; the server gates remain the real enforcement.
 */
import { el } from "../dom.js";
import { profileState } from "../state.js";

export function isOwnProfile() {
	return !!profileState.aliasId
		&& !!profileState.viewerAliasId
		&& profileState.aliasId === profileState.viewerAliasId;
}

function serverMessage(error) {
	if (!error) return "The server refused this change.";
	if (typeof error === "string") return error;
	return error.message || error.details || error.code || "The server refused this change.";
}

/** @param {{heichelId:string, seriesId:string, postId:string, title:string, route:string}} post */
export function postOwnerMenu(post) {
	if (!post?.heichelId || !post?.postId) return null;
	const editHref = post.route && post.route !== "#"
		? `${post.route}${post.route.includes("?") ? "&" : "?"}edit=1`
		: `/heichelos/${encodeURIComponent(post.heichelId)}/series/${encodeURIComponent(post.seriesId || "root")}/${encodeURIComponent(post.postId)}?edit=1`;

	const confirmRow = el("div", { className: "profile-post-owner-confirm" });
	confirmRow.hidden = true;

	const deleteButton = el("button", {
		className: "profile-post-owner-delete",
		text: "Delete",
		attrs: { type: "button" },
		on: {
			click: (event) => {
				event.preventDefault();
				event.stopPropagation();
				confirmRow.hidden = false;
				deleteButton.hidden = true;
			}
		}
	});

	const status = el("span", { className: "profile-post-owner-status" });
	const confirmButton = el("button", {
		className: "profile-post-owner-confirm-delete",
		text: "Delete permanently",
		attrs: { type: "button" },
		on: {
			click: async (event) => {
				event.preventDefault();
				event.stopPropagation();
				confirmButton.disabled = true;
				status.textContent = "Deleting…";
				try {
					const url = `/api/social/heichelos/${encodeURIComponent(post.heichelId)}/series/${encodeURIComponent(post.seriesId || "root")}/post/${encodeURIComponent(post.postId)}`;
					const response = await fetch(url, {
						method: "DELETE",
						headers: { "Content-Type": "application/x-www-form-urlencoded" },
						body: new URLSearchParams({ aliasId: profileState.viewerAliasId })
					});
					let data = null;
					try { data = await response.json(); } catch { /* non-JSON error body */ }
					if (data?.error) throw new Error(serverMessage(data.error));
					if (!response.ok && !data?.success) throw new Error(`Delete failed (${response.status}).`);
					const card = menu.closest("article, .profile-post-card, .profile-contribution-card");
					if (card) {
						const note = el("p", { className: "profile-post-owner-deleted", text: "Post deleted." });
						card.replaceWith(note);
					}
				} catch (e) {
					status.textContent = e.message || "Delete failed.";
					confirmButton.disabled = false;
				}
			}
		}
	});
	const cancelButton = el("button", {
		text: "Keep it",
		attrs: { type: "button" },
		on: {
			click: (event) => {
				event.preventDefault();
				event.stopPropagation();
				confirmRow.hidden = true;
				deleteButton.hidden = false;
				status.textContent = "";
			}
		}
	});
	confirmRow.append(
		el("span", { text: `Delete \u201C${post.title || "this post"}\u201D? Its comments will be removed too.` }),
		confirmButton,
		cancelButton,
		status
	);

	const menu = el("div", { className: "profile-post-owner-menu" }, [
		el("a", {
			className: "profile-post-owner-edit",
			text: "Edit",
			attrs: { href: editHref },
			on: { click: (event) => event.stopPropagation() }
		}),
		deleteButton,
		confirmRow
	]);
	return menu;
}

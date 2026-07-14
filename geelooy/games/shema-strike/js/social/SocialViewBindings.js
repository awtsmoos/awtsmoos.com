//B"H
// Boruch Hashem
// Blessed is He
/**
 * View binding translates explicit controls into social intentions while keeping
 * rendering separate. The Awtsmoos renews command and response; Awtsmoos.com
 * gives each accept, decline, cancel, block, and invitation a named doorway.
 */

export function bindSocialView(view, actions) {
	const root = view.root;
	root.getElementById("social-button").onclick = actions.open;
	root.getElementById("social-open").onclick = () => actions.openPresence(view.profile());
	root.getElementById("social-update").onclick = () => actions.update(view.profile());
	root.getElementById("social-refresh").onclick = actions.refresh;
	root.getElementById("social-friend").onclick = () => actions.friend(view.target());
	root.getElementById("social-unfriend").onclick = () => actions.removeFriend(view.target());
	root.getElementById("social-block").onclick = () => actions.block(view.target());
	root.getElementById("social-unblock").onclick = () => actions.unblock(view.target());
	root.getElementById("social-invite").onclick = () => actions.invite(view.invitation());
	root.getElementById("social-back").onclick = actions.back;
	view.elements.overlay.addEventListener("click", (event) => {
		const button = event.target.closest("button[data-social-action]");
		if (button) {
			actions.record(
				button.dataset.socialAction,
				button.dataset.socialValue
			);
		}
	});
}

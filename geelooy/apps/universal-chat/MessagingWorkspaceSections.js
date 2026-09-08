// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Routes special chambers and dynamically reveals Public Torah only while its navigation generation remains current.
 * @description The Awtsmoos creates Torah, Mail, memory, discovery, and presence without confusing their boundaries; Awtsmoos.com keeps every owner distinct,
 * and Gevurah cancels old asynchronous revelation so a late Torah module can never overwrite the chamber a person deliberately chose afterward.
 */
const WORKSPACE_SECTIONS = new Set(["public", "mail", "activity", "discover", "online", "settings"]);

export class MessagingWorkspaceSections {
	constructor(options) {
		Object.assign(this, options);
		this.revelationGeneration = 0;
	}

	/** Reports whether this router owns the requested special chamber. */
	owns(section) {
		return WORKSPACE_SECTIONS.has(section);
	}

	/** Invalidates every in-flight special revelation before any new route becomes authoritative. */
	cancelPendingRevelation() {
		this.revelationGeneration += 1;
		return this.revelationGeneration;
	}

	/** Reveals one special chamber without forcing Public Torah's module graph into unrelated navigation. */
	async show(section) {
		const generation = this.revelationGeneration;
		this.presence.deactivate();
		this.prepare(section);
		this.mobile.showSpecial();
		if (section === "public") {
			this.showPublicTorahLoading();
			this.publicTorah(generation).catch(() => this.showPublicTorahError(generation));
			return;
		}
		if (section === "mail") {
			this.special.showMail({ requestMail: () => this.actions.requestMail() });
			return;
		}
		if (section === "activity") {
			this.activity.show();
			return;
		}
		if (section === "discover") {
			this.discovery.show();
			return;
		}
		if (section === "online") {
			this.presence.show();
			return;
		}
		this.special.showFriendSettings(
			this.store.relationships.settings,
			(kind, value) => this.actions.savePolicy(kind, value)
		);
	}

	/** Clears list/thread vessels and leaves one truthful heading for the selected special chamber. */
	prepare(section) {
		this.shell.elements.list.hidden = true;
		this.shell.elements.newAction.hidden = true;
		this.shell.elements.threadHeader.hidden = false;
		this.shell.elements.thread.hidden = true;
		this.shell.elements.composer.hidden = true;
		this.shell.elements.loadOlder.hidden = true;
		this.shell.elements.details.hidden = true;
		this.shell.elements.threadTitle.textContent = this.shell.elements.sectionTitle.textContent;
		this.shell.elements.threadSubtitle.textContent = section === "public" ? "" : "One Awtsmoos social-learning workspace";
		this.shell.elements.special.hidden = false;
		this.shell.elements.special.replaceChildren();
	}

	/** Shows a real loading state while Public Torah's optional runtime travels to the page. */
	showPublicTorahLoading() {
		this.shell.elements.special.textContent = "Opening Public Torah sources…";
	}

	/** Imports and mounts Public Torah only if this navigation generation is still current. */
	async publicTorah(generation) {
		const module = await import("/scripts/awtsmoos/social/universalChat/bootstrap.js");
		if (generation !== this.revelationGeneration) {
			return;
		}
		this.shell.elements.special.replaceChildren();
		module.mountUniversalChat({ expanded: true, container: this.shell.elements.special });
	}

	/** Reveals a bounded nontechnical startup failure only if the user is still in the same navigation generation. */
	showPublicTorahError(generation) {
		if (generation !== this.revelationGeneration) {
			return;
		}
		this.shell.elements.special.textContent = "Public Torah could not open. Check your connection and try again.";
	}
}

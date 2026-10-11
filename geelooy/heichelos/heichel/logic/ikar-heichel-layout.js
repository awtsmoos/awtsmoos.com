/* B"H
 * Ikar Heichel layout — full interactivity.
 *
 * Authenticated-user model (localStorage-backed, no backend required):
 * - Sign in / sign out as a named user; the session persists.
 * - Signed-in users get an "Edit page" mode: every [data-edit] text becomes
 *   editable in place; shelves gain publish/unpublish + delete controls;
 *   an "Add a shelf" dialog creates real new shelves; "Reset page" restores
 *   the seeded layout. Every control performs a real persisted transaction.
 */

(function () {
	"use strict";

	var STORE_KEY = "ikar-heichel-v1";
	var ART_BASE = "../../design-refs/law8/ikar-heichel/";
	var ART_PLATES = [
		{ id: "sinai-intense", label: "Sinai" },
		{ id: "kotel-intense", label: "Kotel" },
		{ id: "pillar-fire-intense", label: "Pillar of fire" },
		{ id: "jerusalem-dawn-intense", label: "Jerusalem dawn" },
		{ id: "lake-intense", label: "Lake" },
		{ id: "hero-intense", label: "Cosmic hall" },
		{ id: "post-view-intense", label: "Manuscript" }
	];

	function seedState() {
		return {
			user: null,
			theme: "dark",
			editMode: false,
			hero: {
				kicker: "ב״ה · The Ikar Heichel",
				titleHe: "אוצר התורה כולה",
				titleEn: "The Entire Torah",
				sub: "Torah, translations, series and sefarim — one living library, in Hebrew and English."
			},
			shelves: {
				lede: "Every sefer has its room. Open a shelf to walk inside.",
				items: [
					{ id: "s-tanach", art: "sinai-intense", titleHe: "תנ״ך", titleEn: "Tanach", desc: "The Written Torah with Targum and classic commentaries.", meta: "85 base · 1,011 commentary", href: "/heichelos/ikar/?series=tanach", published: true },
					{ id: "s-yerushalmi", art: "kotel-intense", titleHe: "תלמוד ירושלמי", titleEn: "Yerushalmi", desc: "Talmud Yerushalmi — the Torah of the Land of Israel.", meta: "1,249 translated · 5,572 Hebrew", href: "/heichelos/ikar/?series=yerushalmi", published: true },
					{ id: "s-chassidus", art: "pillar-fire-intense", titleHe: "חסידות", titleEn: "Chassidus", desc: "Sichos, Maamarim and Meluket — the Rebbe's light leading the way.", meta: "2,643 posts", href: "/heichelos/ikar/?series=chassidus", published: true },
					{ id: "s-torah-ohr", art: "jerusalem-dawn-intense", titleHe: "תורה אור", titleEn: "Torah Ohr", desc: "The Alter Rebbe's dawn: Torah Ohr and Likkutei Torah.", meta: "64 study editions", href: "/heichelos/ikar/?series=torah-ohr", published: true },
					{ id: "s-meluket", art: "lake-intense", titleHe: "מלוקט", titleEn: "Meluket", desc: "Gems gathered: the daily Meluket reader.", meta: "214 maamarim", href: "/heichelos/ikar/?series=meluket", published: true },
					{ id: "s-igeres", art: "", titleHe: "אגרות קודש", titleEn: "Igeres HaKodesh", desc: "The Rebbe's letters — staging for import.", meta: "Staging", href: "", published: false, staging: true }
				]
			},
			postview: {
				lede: "Every post reads like a sefer: Hebrew and English, phrase by phrase, with footnotes at a tap.",
				eyebrow: "Post view",
				title: "A page that reads like a sefer",
				sampleHe: "בְּרֵאשִׁית בָּרָא אֱלֹקִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ",
				sampleEn: "In the beginning Elokim created the heavens and the earth."
			},
			stats: { posts: "21,211", translated: "9,490", hebrew: "11,721", shelves: "5" }
		};
	}

	function loadState() {
		try {
			var raw = localStorage.getItem(STORE_KEY);
			if (!raw) return seedState();
			var parsed = JSON.parse(raw);
			var seed = seedState();
			// Shallow-merge so new seed fields appear for older stores.
			Object.keys(seed).forEach(function (k) {
				if (parsed[k] === undefined) parsed[k] = seed[k];
			});
			return parsed;
		} catch (e) {
			return seedState();
		}
	}

	var state = loadState();

	function saveState() {
		try {
			localStorage.setItem(STORE_KEY, JSON.stringify(state));
		} catch (e) { /* storage full or private mode — page still works in memory */ }
	}

	function esc(s) {
		return String(s == null ? "" : s)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	}

	/* ---------------- toast ---------------- */
	var toastRegion = document.getElementById("ikarToastRegion");
	function toast(msg) {
		var el = document.createElement("div");
		el.className = "ikar-toast";
		el.textContent = msg;
		toastRegion.appendChild(el);
		window.setTimeout(function () { el.classList.add("is-out"); }, 2600);
		window.setTimeout(function () { el.remove(); }, 3100);
	}

	/* ---------------- theme ---------------- */
	function applyTheme() {
		document.body.setAttribute("data-theme", state.theme === "light" ? "light" : "dark");
	}

	/* ---------------- auth ---------------- */
	var authBox = document.getElementById("ikarAuth");
	var editToggle = document.getElementById("ikarEditToggle");
	var editbar = document.getElementById("ikarEditbar");

	function renderAuth() {
		authBox.innerHTML = "";
		if (state.user) {
			var chip = document.createElement("div");
			chip.className = "ikar-user-chip";
			var av = document.createElement("span");
			av.className = "ikar-avatar";
			av.textContent = state.user.name.trim().charAt(0).toUpperCase() || "א";
			av.setAttribute("aria-hidden", "true");
			var nm = document.createElement("span");
			nm.className = "ikar-user-name";
			nm.textContent = state.user.name;
			var out = document.createElement("button");
			out.type = "button";
			out.className = "ikar-icon-btn ikar-signout";
			out.textContent = "Sign out";
			out.setAttribute("aria-label", "Sign out");
			out.addEventListener("click", signOut);
			chip.appendChild(av);
			chip.appendChild(nm);
			chip.appendChild(out);
			authBox.appendChild(chip);
			editToggle.hidden = false;
		} else {
			var btn = document.createElement("button");
			btn.type = "button";
			btn.className = "ikar-btn ikar-btn-primary ikar-btn-small";
			btn.textContent = "Sign in";
			btn.addEventListener("click", openSignIn);
			authBox.appendChild(btn);
			editToggle.hidden = true;
			state.editMode = false;
		}
		applyEditMode();
	}

	function signOut() {
		var name = state.user ? state.user.name : "";
		state.user = null;
		state.editMode = false;
		saveState();
		renderAuth();
		renderShelves();
		toast(name ? "Signed out. Shalom, " + name + "." : "Signed out.");
	}

	/* ---------------- dialog ---------------- */
	var backdrop = document.getElementById("ikarDialogBackdrop");
	var dialogTitle = document.getElementById("ikarDialogTitle");
	var dialogBody = document.getElementById("ikarDialogBody");
	var dialogActions = document.getElementById("ikarDialogActions");
	var lastFocus = null;

	function openDialog(title, buildBody, buildActions) {
		lastFocus = document.activeElement;
		dialogTitle.textContent = title;
		dialogBody.innerHTML = "";
		dialogActions.innerHTML = "";
		buildBody(dialogBody);
		buildActions(dialogActions, closeDialog);
		backdrop.hidden = false;
		var first = dialogBody.querySelector("input, select, textarea") || dialogActions.querySelector("button");
		if (first) first.focus();
	}

	function closeDialog() {
		backdrop.hidden = true;
		if (lastFocus && lastFocus.focus) lastFocus.focus();
	}

	backdrop.addEventListener("click", function (e) {
		if (e.target === backdrop) closeDialog();
	});
	document.addEventListener("keydown", function (e) {
		if (e.key === "Escape" && !backdrop.hidden) closeDialog();
	});

	function field(labelText, input) {
		var wrap = document.createElement("label");
		wrap.className = "ikar-field";
		var sp = document.createElement("span");
		sp.className = "ikar-field-label";
		sp.textContent = labelText;
		wrap.appendChild(sp);
		wrap.appendChild(input);
		return wrap;
	}

	function textInput(value, placeholder) {
		var i = document.createElement("input");
		i.type = "text";
		i.className = "ikar-input";
		i.value = value || "";
		if (placeholder) i.placeholder = placeholder;
		return i;
	}

	function dialogButton(label, kind, onClick) {
		var b = document.createElement("button");
		b.type = "button";
		b.className = "ikar-btn ikar-btn-small " + (kind || "ikar-btn-ghost");
		b.textContent = label;
		b.addEventListener("click", onClick);
		return b;
	}

	function openSignIn() {
		openDialog("Sign in", function (body) {
			var name = textInput("", "Your name");
			name.setAttribute("aria-label", "Your name");
			body.appendChild(field("Display name", name));
			body._nameInput = name;
		}, function (actions, close) {
			actions.appendChild(dialogButton("Cancel", "ikar-btn-ghost", close));
			actions.appendChild(dialogButton("Sign in", "ikar-btn-primary", function () {
				var input = dialogBody._nameInput;
				var name = input.value.trim();
				if (!name) {
					input.focus();
					toast("Enter a name to sign in.");
					return;
				}
				state.user = { name: name, since: Date.now() };
				saveState();
				close();
				renderAuth();
				renderShelves();
				toast("Shalom, " + name + " — you are signed in.");
			}));
		});
	}

	/* ---------------- shelves ---------------- */
	var grid = document.getElementById("ikarShelfGrid");

	function artSrc(id) {
		return ART_BASE + id + ".webp";
	}

	function shelfCard(item) {
		var li = document.createElement("li");
		li.className = "ikar-shelf-card" + (item.staging ? " is-staging" : "") + (!item.published && !item.staging ? " is-unpublished" : "");
		li.dataset.shelfId = item.id;

		var art = document.createElement("div");
		art.className = "ikar-shelf-art";
		if (item.art) {
			var img = document.createElement("img");
			img.src = artSrc(item.art);
			img.alt = "";
			img.loading = "lazy";
			art.appendChild(img);
		} else {
			art.classList.add("ikar-shelf-art--seal");
			var seal = document.createElement("span");
			seal.className = "ikar-shelf-seal";
			seal.textContent = "א";
			seal.setAttribute("aria-hidden", "true");
			art.appendChild(seal);
		}
		li.appendChild(art);

		var body = document.createElement("div");
		body.className = "ikar-shelf-body";

		var h3 = document.createElement("h3");
		h3.className = "ikar-shelf-title";
		var he = document.createElement("span");
		he.className = "ikar-shelf-he";
		he.lang = "he";
		he.textContent = item.titleHe;
		he.setAttribute("data-shelf-field", "titleHe");
		he.setAttribute("data-shelf-id", item.id);
		h3.appendChild(he);
		var en = document.createElement("span");
		en.textContent = item.titleEn;
		en.setAttribute("data-shelf-field", "titleEn");
		en.setAttribute("data-shelf-id", item.id);
		h3.appendChild(en);
		body.appendChild(h3);

		var desc = document.createElement("p");
		desc.className = "ikar-shelf-desc";
		desc.textContent = item.desc;
		desc.setAttribute("data-shelf-field", "desc");
		desc.setAttribute("data-shelf-id", item.id);
		body.appendChild(desc);

		var meta = document.createElement("p");
		meta.className = "ikar-shelf-meta";
		meta.textContent = item.meta;
		meta.setAttribute("data-shelf-field", "meta");
		meta.setAttribute("data-shelf-id", item.id);
		body.appendChild(meta);

		if (state.editMode && state.user && !item.staging) {
			var ctrls = document.createElement("div");
			ctrls.className = "ikar-card-controls";

			var pub = document.createElement("button");
			pub.type = "button";
			pub.className = "ikar-mini-btn" + (item.published ? " is-on" : "");
			pub.setAttribute("aria-pressed", item.published ? "true" : "false");
			pub.textContent = item.published ? "Published" : "Unpublished";
			pub.addEventListener("click", function () { togglePublished(item.id); });
			ctrls.appendChild(pub);

			var del = document.createElement("button");
			del.type = "button";
			del.className = "ikar-mini-btn ikar-mini-danger";
			del.textContent = "Delete";
			del.setAttribute("aria-label", "Delete shelf " + item.titleEn);
			del.addEventListener("click", function () { deleteShelf(item.id); });
			ctrls.appendChild(del);

			body.appendChild(ctrls);
		}

		if (item.staging) {
			var soon = document.createElement("span");
			soon.className = "ikar-shelf-soon";
			soon.textContent = "Arriving";
			soon.setAttribute("aria-disabled", "true");
			body.appendChild(soon);
		} else if (item.published) {
			var link = document.createElement("a");
			link.className = "ikar-shelf-link";
			link.href = item.href || "/heichelos/ikar/";
			link.innerHTML = "Open <span class=\"ikar-arrow\" aria-hidden=\"true\">→</span>";
			link.setAttribute("aria-label", "Open " + item.titleEn);
			body.appendChild(link);
		} else {
			var hidden = document.createElement("span");
			hidden.className = "ikar-shelf-soon";
			hidden.textContent = "Unpublished";
			hidden.setAttribute("aria-disabled", "true");
			body.appendChild(hidden);
		}

		li.appendChild(body);
		return li;
	}

	function renderShelves() {
		grid.innerHTML = "";
		state.shelves.items.forEach(function (item) {
			grid.appendChild(shelfCard(item));
		});
		// Stats shelf count follows the real shelf list.
		var live = state.shelves.items.filter(function (i) { return i.published && !i.staging; }).length;
		state.stats.shelves = String(live);
		var statEl = document.querySelector('[data-edit="stats.shelves"]');
		if (statEl && !statEl.isContentEditable) statEl.textContent = String(live);
		applyEditMode();
	}

	function findShelf(id) {
		for (var i = 0; i < state.shelves.items.length; i++) {
			if (state.shelves.items[i].id === id) return state.shelves.items[i];
		}
		return null;
	}

	function togglePublished(id) {
		var item = findShelf(id);
		if (!item || !state.user) return;
		item.published = !item.published;
		saveState();
		renderShelves();
		toast(item.titleEn + (item.published ? " published." : " unpublished."));
	}

	function deleteShelf(id) {
		var item = findShelf(id);
		if (!item || !state.user) return;
		if (!window.confirm("Delete the shelf \"" + item.titleEn + "\"?")) return;
		state.shelves.items = state.shelves.items.filter(function (i) { return i.id !== id; });
		saveState();
		renderShelves();
		toast("Shelf deleted: " + item.titleEn + ".");
	}

	function openAddShelf() {
		if (!state.user) return;
		openDialog("Add a shelf", function (body) {
			var titleEn = textInput("", "e.g. Tanya");
			var titleHe = textInput("", "e.g. תניא");
			var desc = textInput("", "One-line description");
			var meta = textInput("", "e.g. 5 parts · 53 chapters");
			var href = textInput("/heichelos/ikar/", "Link");
			body.appendChild(field("English title", titleEn));
			body.appendChild(field("Hebrew title", titleHe));
			body.appendChild(field("Description", desc));
			body.appendChild(field("Meta line", meta));
			body.appendChild(field("Link", href));

			var artWrap = document.createElement("div");
			artWrap.className = "ikar-field";
			var artLabel = document.createElement("span");
			artLabel.className = "ikar-field-label";
			artLabel.textContent = "Art plate";
			artWrap.appendChild(artLabel);
			var picker = document.createElement("div");
			picker.className = "ikar-art-picker";
			ART_PLATES.forEach(function (plate, idx) {
				var opt = document.createElement("label");
				opt.className = "ikar-art-option";
				var radio = document.createElement("input");
				radio.type = "radio";
				radio.name = "ikar-art";
				radio.value = plate.id;
				if (idx === 0) radio.checked = true;
				var thumb = document.createElement("img");
				thumb.src = artSrc(plate.id);
				thumb.alt = "";
				thumb.loading = "lazy";
				var cap = document.createElement("span");
				cap.textContent = plate.label;
				opt.appendChild(radio);
				opt.appendChild(thumb);
				opt.appendChild(cap);
				picker.appendChild(opt);
			});
			artWrap.appendChild(picker);
			body.appendChild(artWrap);
			body._draft = { titleEn: titleEn, titleHe: titleHe, desc: desc, meta: meta, href: href };
		}, function (actions, close) {
			actions.appendChild(dialogButton("Cancel", "ikar-btn-ghost", close));
			actions.appendChild(dialogButton("Add shelf", "ikar-btn-primary", function () {
				var d = dialogBody._draft;
				var titleEn = d.titleEn.value.trim();
				if (!titleEn) {
					d.titleEn.focus();
					toast("Give the shelf an English title.");
					return;
				}
				var picked = dialogBody.querySelector('input[name="ikar-art"]:checked');
				state.shelves.items.push({
					id: "s-" + Date.now().toString(36),
					art: picked ? picked.value : "sinai-intense",
					titleHe: d.titleHe.value.trim(),
					titleEn: titleEn,
					desc: d.desc.value.trim() || "A new shelf in the Ikar heichel.",
					meta: d.meta.value.trim(),
					href: d.href.value.trim() || "/heichelos/ikar/",
					published: true
				});
				saveState();
				close();
				renderShelves();
				toast("Shelf added: " + titleEn + ".");
			}));
		});
	}

	/* ---------------- in-place editing ---------------- */
	function getByPath(path) {
		var parts = path.split(".");
		var obj = state;
		for (var i = 0; i < parts.length - 1; i++) {
			obj = obj[parts[i]];
			if (!obj) return null;
		}
		return { obj: obj, key: parts[parts.length - 1] };
	}

	function applyEditMode() {
		var on = !!(state.editMode && state.user);
		document.body.classList.toggle("ikar-is-editing", on);
		editToggle.textContent = state.editMode ? "Done editing" : "Edit page";
		editToggle.setAttribute("aria-pressed", state.editMode ? "true" : "false");
		editbar.hidden = !on;

		document.querySelectorAll("[data-edit]").forEach(function (el) {
			el.classList.toggle("ikar-editable", on);
			if (on) {
				el.setAttribute("tabindex", "0");
				el.setAttribute("role", "textbox");
				el.setAttribute("aria-label", "Edit text. Press Enter to save, Escape to cancel.");
			} else {
				if (el.isContentEditable) finishInlineEdit(el, false);
				el.removeAttribute("tabindex");
				el.removeAttribute("role");
				el.removeAttribute("aria-label");
			}
		});
		document.querySelectorAll("[data-shelf-field]").forEach(function (el) {
			el.classList.toggle("ikar-editable", on);
			if (on) {
				el.setAttribute("tabindex", "0");
				el.setAttribute("role", "textbox");
			} else {
				if (el.isContentEditable) finishInlineEdit(el, false);
				el.removeAttribute("tabindex");
				el.removeAttribute("role");
			}
		});
	}

	function beginInlineEdit(el) {
		if (el.isContentEditable) return;
		el.dataset.origText = el.textContent;
		el.contentEditable = "true";
		el.focus();
		// Place caret at end.
		try {
			var range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		} catch (e) { /* older engines */ }
	}

	function finishInlineEdit(el, commit) {
		el.contentEditable = "false";
		el.blur();
		if (!commit) {
			el.textContent = el.dataset.origText || el.textContent;
			delete el.dataset.origText;
			return;
		}
		var next = el.textContent.trim();
		delete el.dataset.origText;
		if (el.hasAttribute("data-edit")) {
			var ref = getByPath(el.getAttribute("data-edit"));
			if (ref && next) {
				ref.obj[ref.key] = next;
				el.textContent = next;
				saveState();
				toast("Saved.");
			} else {
				el.textContent = ref ? ref.obj[ref.key] : el.textContent;
			}
		} else if (el.hasAttribute("data-shelf-field")) {
			var item = findShelf(el.getAttribute("data-shelf-id"));
			var f = el.getAttribute("data-shelf-field");
			if (item && next) {
				item[f] = next;
				el.textContent = next;
				saveState();
				toast("Saved.");
			} else if (item) {
				el.textContent = item[f];
			}
		}
	}

	document.addEventListener("click", function (e) {
		var t = e.target.closest("[data-edit], [data-shelf-field]");
		if (!t || !state.editMode || !state.user) return;
		if (!t.classList.contains("ikar-editable")) return;
		if (!t.isContentEditable) beginInlineEdit(t);
	});

	document.addEventListener("keydown", function (e) {
		var t = e.target.closest("[data-edit], [data-shelf-field]");
		if (!t || !t.isContentEditable) return;
		if (e.key === "Enter") {
			e.preventDefault();
			finishInlineEdit(t, true);
		} else if (e.key === "Escape") {
			e.preventDefault();
			finishInlineEdit(t, false);
		}
	});

	document.addEventListener("focusout", function (e) {
		var t = e.target.closest("[data-edit], [data-shelf-field]");
		if (t && t.isContentEditable) {
			// Commit on blur unless Escape already reverted.
			window.setTimeout(function () {
				if (t.isContentEditable && t.dataset.origText !== undefined) finishInlineEdit(t, true);
			}, 0);
		}
	});

	/* ---------------- topbar wiring ---------------- */
	document.getElementById("ikarThemeBtn").addEventListener("click", function () {
		state.theme = state.theme === "light" ? "dark" : "light";
		saveState();
		applyTheme();
		toast(state.theme === "light" ? "Light theme." : "Dark theme.");
	});

	editToggle.addEventListener("click", function () {
		if (!state.user) {
			toast("Sign in to edit the page.");
			return;
		}
		state.editMode = !state.editMode;
		saveState();
		renderShelves();
		applyEditMode();
		toast(state.editMode ? "Edit mode on — click any text to edit it." : "Edit mode off.");
	});

	document.getElementById("ikarAddShelf").addEventListener("click", openAddShelf);
	document.getElementById("ikarResetPage").addEventListener("click", function () {
		if (!window.confirm("Reset the whole page to the seeded layout? Your edits will be lost.")) return;
		var user = state.user;
		var theme = state.theme;
		state = seedState();
		state.user = user;
		state.theme = theme;
		saveState();
		applyTheme();
		renderAuth();
		renderShelves();
		toast("Page reset to the seeded layout.");
	});

	/* ---------------- boot ---------------- */
	applyTheme();
	renderAuth();
	renderShelves();
})();

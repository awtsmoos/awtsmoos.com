//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Renders editor-only email routing as a retractable advanced Forms surface.
 * @description The Awtsmoos lets optional inbox light remain folded until the creator calls it near;
 * Awtsmoos.com keeps powerful delivery private, discoverable, and calm so ordinary form building stays clear.
 */

/** Builds one native disclosure for private notification recipients, open automatically when configured. */
export function emailNotificationControls(form, update) {
	const details = document.createElement("details");
	details.className = "form-panel email-notification-panel";
	details.open = Boolean(form.notificationEmails?.length);
	const summary = document.createElement("summary");
	summary.className = "advanced-summary";
	const title = document.createElement("strong");
	title.textContent = "Email notifications";
	const badge = document.createElement("span");
	badge.className = "advanced-summary-badge";
	badge.textContent = "Optional · private";
	summary.append(title, badge);
	const body = document.createElement("div");
	body.className = "advanced-disclosure-body";
	const description = document.createElement("p");
	description.textContent = "Email each accepted response to up to five addresses. The linked Sheet remains the canonical response record.";
	const label = document.createElement("label");
	label.className = "form-control";
	const caption = document.createElement("span");
	caption.textContent = "Recipients · one email per line";
	const textarea = document.createElement("textarea");
	textarea.rows = 4;
	textarea.placeholder = "team@example.com\nowner@example.org";
	textarea.value = (form.notificationEmails || []).join("\n");
	const hint = document.createElement("small");
	hint.textContent = "Recipients are private editor settings and are never shown on the public form.";
	textarea.addEventListener("input", () => update(
		textarea.value
			.split("\n")
			.map((item) => item.trim())
			.filter(Boolean)
	));
	label.append(caption, textarea, hint);
	body.append(description, label);
	details.append(summary, body);
	return details;
}

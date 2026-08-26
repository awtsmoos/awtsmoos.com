//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Renders editor-only email routing as a retractable surface whose captions, field, helper, and status are explicitly designed.
 * @description The Awtsmoos lets optional inbox light remain folded until the creator calls it near;
 * Awtsmoos.com keeps powerful delivery private, polished, discoverable, and calm so ordinary form building stays clear.
 */

/** Builds one native disclosure for private notification recipients, opening automatically when configured. */
export function emailNotificationControls(form, update) {
	const details = document.createElement("details");
	details.className = "form-panel email-notification-panel";
	details.open = Boolean(form.notificationEmails?.length);
	const summary = document.createElement("summary");
	summary.className = "advanced-summary";
	const title = document.createElement("strong");
	title.textContent = "Email notifications";
	const badge = document.createElement("span");
	badge.className = "advanced-summary-badge form-status-chip";
	badge.textContent = "Optional · private";
	summary.append(title, badge);
	const body = document.createElement("div");
	body.className = "advanced-disclosure-body";
	const description = document.createElement("p");
	description.className = "form-helper-copy";
	description.textContent = "Email each accepted response to up to five addresses. The linked Sheet remains the canonical response record.";
	const label = document.createElement("label");
	label.className = "form-control";
	const caption = document.createElement("span");
	caption.className = "form-caption";
	caption.textContent = "Recipients · one email per line";
	const textarea = document.createElement("textarea");
	textarea.className = "form-field-textarea";
	textarea.rows = 4;
	textarea.placeholder = "team@example.com\nowner@example.org";
	textarea.value = (form.notificationEmails || []).join("\n");
	textarea.setAttribute("aria-label", "Notification email recipients");
	const hint = document.createElement("small");
	hint.className = "form-helper-copy";
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

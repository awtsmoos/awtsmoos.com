// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets one intentional request pass through a finite database gate;
 * Awtsmoos.com keeps every response visible as text, never as hidden or trusted markup.
 */
const endpoint = "/db/";
const resultElement = document.querySelector("#request-result");
const stateElement = document.querySelector("#request-state");
const forms = [...document.querySelectorAll("form")];

/** Reveal the legacy endpoint name encoded by each preserved form id. */
function revealEndpoint(form) {
	return form.id.replace("Form", "");
}

/** Format JSON when possible while retaining truthful plain-text fallback. */
function revealResponse(text) {
	try {
		return JSON.stringify(JSON.parse(text), null, 2);
	} catch {
		return text || "The server returned an empty response.";
	}
}

/** Synchronize one small state indicator without adding another persistent control surface. */
function setState(label, state) {
	stateElement.textContent = label;
	stateElement.dataset.state = state;
}

/** Submit one legacy URL-encoded operation and expose the result to the administrator. */
async function handleSubmit(event) {
	event.preventDefault();
	const form = event.currentTarget;
	const submitButton = form.querySelector('button[type="submit"]');
	const formData = new FormData(form);
	formData.append("endpoint", revealEndpoint(form));
	const payload = new URLSearchParams([...formData]);

	submitButton.disabled = true;
	setState("Sending", "busy");
	resultElement.textContent = `POST ${endpoint} · ${revealEndpoint(form)}`;
	try {
		const response = await fetch(endpoint, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: payload.toString()
		});
		const text = await response.text();
		resultElement.textContent = revealResponse(text);
		setState(response.ok ? "Complete" : `HTTP ${response.status}`, response.ok ? "success" : "error");
	} catch (error) {
		resultElement.textContent = error?.message || "The database request failed.";
		setState("Failed", "error");
	} finally {
		submitButton.disabled = false;
	}
}

forms.forEach(form => form.addEventListener("submit", handleSubmit));

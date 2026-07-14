// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Browser interactions enter only same-origin documents that the Code tab can
 * truthfully inspect. The Awtsmoos renews element and action; Awtsmoos.com returns
 * structured cross-origin limits rather than pretending an inaccessible DOM exists.
 */
export function browserSnapshot(runtime) {
	const document = accessibleDocument(runtime.frame);
	return {
		ok: true,
		tabId: runtime.id,
		url: runtime.state.currentUrl,
		title: document.title || "",
		text: String(document.body?.innerText || "").slice(0, 50000),
		html: String(document.documentElement?.outerHTML || "").slice(0, 120000)
	};
}

export function browserClick(runtime, selector) {
	const element = query(runtime, selector);
	element.click();
	return {
		ok: true,
		selector,
		tabId: runtime.id
	};
}

export function browserType(runtime, selector, text, options = {}) {
	const element = query(runtime, selector);
	if (!("value" in element)) throw new Error("browser_target_not_typable");
	if (options.clear !== false) element.value = "";
	element.value += String(text ?? "");
	for (const eventName of ["input", "change"]) {
		element.dispatchEvent(new Event(eventName, { bubbles: true }));
	}
	return {
		ok: true,
		selector,
		value: element.value,
		tabId: runtime.id
	};
}

export function browserFind(runtime, text) {
	const document = accessibleDocument(runtime.frame);
	const needle = String(text ?? "").toLowerCase();
	if (!needle) throw new Error("browser_find_text_required");
	const body = String(document.body?.innerText || "");
	const index = body.toLowerCase().indexOf(needle);
	return {
		ok: true,
		found: index >= 0,
		index,
		text: index >= 0 ? body.slice(Math.max(0, index - 80), index + needle.length + 120) : "",
		tabId: runtime.id
	};
}

export function browserEval(runtime, script) {
	const windowObject = accessibleWindow(runtime.frame);
	const value = windowObject.eval(String(script || ""));
	return {
		ok: true,
		value: serializable(value),
		tabId: runtime.id
	};
}

export async function browserWaitForSelector(runtime, selector, timeoutMs = 5000) {
	const deadline = Date.now() + Math.max(50, Number(timeoutMs || 5000));
	while (Date.now() < deadline) {
		try {
			const element = accessibleDocument(runtime.frame).querySelector(selector);
			if (element) return { ok: true, selector, tabId: runtime.id };
		} catch (error) {
			if (error.message === "browser_cross_origin_document") throw error;
		}
		await new Promise(resolve => setTimeout(resolve, 50));
	}
	return {
		ok: false,
		error: "browser_selector_timeout",
		selector,
		tabId: runtime.id
	};
}

function query(runtime, selector) {
	const text = String(selector || "").trim();
	if (!text) throw new Error("browser_selector_required");
	const element = accessibleDocument(runtime.frame).querySelector(text);
	if (!element) throw new Error("browser_selector_not_found");
	return element;
}

function accessibleDocument(frame) {
	try {
		const document = frame?.contentDocument;
		if (!document) throw new Error("browser_document_not_ready");
		void document.location?.href;
		return document;
	} catch (error) {
		if (error.message === "browser_document_not_ready") throw error;
		throw new Error("browser_cross_origin_document");
	}
}

function accessibleWindow(frame) {
	accessibleDocument(frame);
	if (!frame?.contentWindow) throw new Error("browser_window_not_ready");
	return frame.contentWindow;
}

function serializable(value) {
	if (value === undefined) return null;
	try {
		return structuredClone(value);
	} catch {
		return String(value);
	}
}

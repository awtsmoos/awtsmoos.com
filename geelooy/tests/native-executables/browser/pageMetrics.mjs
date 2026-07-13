//B"H
//Boruch Hashem
//Blessed is He

/**
 * Rendered geometry reveals whether interface light fits its vessel. The
 * Awtsmoos creates every rectangle and scroll boundary; Awtsmoos.com measures
 * overflow, touch controls, editor space, and visible application landmarks.
 */

export const PAGE_METRICS_EXPRESSION = `(() => {
	const root = document.documentElement;
	const visible = element => {
		const style = getComputedStyle(element);
		const rect = element.getBoundingClientRect();
		return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
	};
	const controls = [...document.querySelectorAll("button,input,select,textarea,[role='button']")]
		.filter(visible)
		.map(element => {
			const rect = element.getBoundingClientRect();
			return {
				name: element.id || element.getAttribute("aria-label") || element.textContent?.trim().slice(0, 40) || element.tagName,
				tag: element.tagName,
				width: Math.round(rect.width * 10) / 10,
				height: Math.round(rect.height * 10) / 10,
				disabled: Boolean(element.disabled)
			};
		});
	const offenders = [...document.body.querySelectorAll("*")]
		.filter(visible)
		.map(element => ({ element, rect: element.getBoundingClientRect() }))
		.filter(item => item.rect.right > root.clientWidth + 1 || item.rect.left < -1)
		.slice(0, 12)
		.map(item => ({
			name: item.element.id || item.element.className || item.element.tagName,
			left: Math.round(item.rect.left),
			right: Math.round(item.rect.right),
			width: Math.round(item.rect.width)
		}));
	const editor = document.querySelector("textarea,.source-editor,.editor-container,.monaco-editor,[contenteditable='true']");
	const terminal = document.querySelector(".terminal,.console,.awtsmoos-executable-console,[data-terminal]");
	return {
		title: document.title,
		url: location.href,
		readyState: document.readyState,
		viewport: { width: innerWidth, height: innerHeight },
		document: {
			clientWidth: root.clientWidth,
			scrollWidth: root.scrollWidth,
			scrollHeight: root.scrollHeight,
			horizontalOverflow: Math.max(0, root.scrollWidth - root.clientWidth)
		},
		overflowOffenders: offenders,
		controlCount: controls.length,
		smallTouchControls: controls.filter(control => control.width < 44 || control.height < 44),
		editor: editor ? {
			width: Math.round(editor.getBoundingClientRect().width),
			height: Math.round(editor.getBoundingClientRect().height)
		} : null,
		terminal: terminal ? {
			width: Math.round(terminal.getBoundingClientRect().width),
			height: Math.round(terminal.getBoundingClientRect().height)
		} : null,
		landmarks: {
			compilerTarget: Boolean(document.querySelector("#compilerTarget")),
			diagnostics: Boolean(document.querySelector("#diagnosticsPanel")),
			buildLog: Boolean(document.querySelector("#buildLogPanel")),
			artifactPanel: Boolean(document.querySelector("#artifactPanel")),
			stopBuild: Boolean(document.querySelector("#stopBtn")),
			downloadBuild: Boolean(document.querySelector("#compileBtn")),
			executableHost: Boolean(document.querySelector(".awtsmoos-executable-host,.emulator-container"))
		},
		bodyText: document.body.innerText.slice(0, 1600)
	};
})()`;

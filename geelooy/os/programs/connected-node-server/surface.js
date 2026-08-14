// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Creates the Connected Node Server vessel without owning remote authority.
 * The Awtsmoos renews machine, project, process, port, preview, and ledger beyond
 * every finite control; Awtsmoos.com keeps this surface semantic and explicit so
 * full-control Node remains visibly bound to the user's own connected machine.
 */

export function createServerSurface() {
	const root = node("main", "connectedServer");
	const hero = node("section", "connectedServer__hero");
	hero.append(
		text("p", "connectedServer__kicker", 'B"H · Connected Compute'),
		text("h1", "", "Node server. Your machine. Geelooy control plane."),
		text("p", "connectedServer__lead", "Start and supervise a Node.js project on an account-owned connected machine, expose its local port, inspect logs, and see server-authoritative Peruta usage without leaving Geelooy OS.")
	);

	const form = node("form", "connectedServer__form");
	form.id = "connectedNodeServerForm";
	const device = field("Machine", "select", "serverDevice");
	const cwd = field("Project directory", "input", "serverCwd", { placeholder: "/Users/you/project" });
	const entry = field("Node entry file", "input", "serverEntry", { placeholder: "server.js", value: "server.js" });
	const port = field("Local port", "input", "serverPort", { type: "number", min: "1", max: "65535", value: "3000" });
	const args = field("Arguments as JSON array", "input", "serverArgs", { placeholder: "[]", value: "[]" });
	const start = button("Start server", "serverStart", "primary");
	form.append(device.wrap, cwd.wrap, entry.wrap, port.wrap, args.wrap, start);

	const lifecycle = node("section", "connectedServer__statusPanel");
	lifecycle.append(
		text("p", "connectedServer__kicker", "Live server"),
		text("h2", "", "Process & preview"),
		text("p", "connectedServer__status", "No server started yet.")
	);
	const job = text("code", "connectedServer__job", "Job: —");
	const controls = node("div", "connectedServer__controls");
	controls.append(
		button("Refresh", "serverRefresh"),
		button("Expose port", "serverExpose"),
		button("Stop", "serverStop", "danger")
	);
	const preview = node("a", "connectedServer__preview");
	preview.textContent = "No preview exposed";
	preview.hidden = true;
	preview.target = "_blank";
	preview.rel = "noopener noreferrer";
	lifecycle.append(job, controls, preview);

	const logs = node("section", "connectedServer__logsPanel");
	logs.append(text("h2", "", "Server logs"));
	const logOutput = text("pre", "connectedServer__logs", "Start a server to stream stdout and stderr.");
	logs.append(logOutput);

	const usage = node("section", "connectedServer__usagePanel");
	usage.append(text("h2", "", "Peruta usage"));
	const usageGrid = node("div", "connectedServer__usageGrid");
	usage.append(usageGrid);

	const message = text("p", "connectedServer__message", "Connected Node Server ready.");
	message.setAttribute("role", "status");
	root.append(hero, form, lifecycle, logs, usage, message);

	return Object.freeze({
		args: args.input,
		cwd: cwd.input,
		device: device.input,
		entry: entry.input,
		form,
		job,
		logOutput,
		message,
		port: port.input,
		preview,
		root,
		start,
		status: lifecycle.querySelector(".connectedServer__status"),
		stop: controls.querySelector("#serverStop"),
		expose: controls.querySelector("#serverExpose"),
		refresh: controls.querySelector("#serverRefresh"),
		usageGrid
	});
}

function field(labelText, tagName, id, attrs = {}) {
	const wrap = node("label", "connectedServer__field");
	wrap.append(text("span", "", labelText));
	const input = node(tagName);
	input.id = id;
	for (const [key, value] of Object.entries(attrs)) input.setAttribute(key, value);
	wrap.append(input);
	return { input, wrap };
}

function button(label, id, tone = "secondary") {
	const value = text("button", `connectedServer__button connectedServer__button--${tone}`, label);
	value.type = id === "serverStart" ? "submit" : "button";
	value.id = id;
	return value;
}

function node(tag, className = "") {
	const value = document.createElement(tag);
	value.className = className;
	return value;
}

function text(tag, className, value) {
	const element = node(tag, className);
	element.textContent = value;
	return element;
}

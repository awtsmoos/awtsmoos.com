// Popup for the Shliach Browser Link. Talks to background.js via runtime messages.

const $ = (id) => document.getElementById(id);

function fmtTime(ms) {
	if (!ms) return "—";
	return new Date(ms).toLocaleTimeString();
}

function render(state) {
	$("extName").textContent = state.name || "Shliach Browser Link";
	$("extVersion").textContent = "Version: " + (state.version || "?") +
		(state.features && state.features.debugger ? " · Unrestricted" :
			state.features && state.features.contentScript ? " · Standard" : " · Minimal");
	const paired = state.relayState === "paired";
	const connecting = state.relayState === "connecting";
	$("relayDot").className = "dot " + (paired ? "on" : connecting ? "busy" : "off");
	$("relayText").textContent = paired ? "Connected to your AI" :
		connecting ? "Connecting…" : "Not connected";
	$("connectBtn").classList.toggle("hidden", paired || connecting);
	$("disconnectBtn").classList.toggle("hidden", !paired && !connecting);
	if (state.pairingCode && !$("codeInput").value) $("codeInput").value = state.pairingCode;
	const rec = state.features && state.features.debugger;
	$("recorder").classList.toggle("hidden", !rec);
	if (rec) {
		$("count").textContent = (state.count || 0).toLocaleString();
		$("countBodies").textContent = (state.withBodies || 0).toLocaleString();
		$("attachedTabs").textContent = (state.attachedTabs || 0).toLocaleString();
		$("started").textContent = fmtTime(state.startedAt);
		$("startBtn").classList.toggle("hidden", !!state.recording);
		$("stopBtn").classList.toggle("hidden", !state.recording);
		$("downloadBtn").disabled = (state.count || 0) === 0;
		$("clearBtn").disabled = (state.count || 0) === 0;
		$("streamBox").checked = !!state.networkStreaming;
	}
}

function refresh() {
	chrome.runtime.sendMessage({ action: "getState" }, (state) => {
		if (chrome.runtime.lastError || !state) return;
		render(state);
	});
}

function showMsg(text) {
	$("msg").textContent = text;
	setTimeout(() => { $("msg").textContent = ""; }, 5000);
}

$("connectBtn").addEventListener("click", () => {
	const code = $("codeInput").value.trim();
	if (!code) {
		showMsg("Type the pairing code your AI gave you first.");
		return;
	}
	showMsg("Connecting…");
	chrome.runtime.sendMessage({ action: "connect", code }, (res) => {
		if (res && res.ok) showMsg("Connected — your AI can now see this browser.");
		else showMsg("Could not connect: " + ((res && res.error) || "unknown error"));
		refresh();
	});
});

$("disconnectBtn").addEventListener("click", () => {
	chrome.runtime.sendMessage({ action: "disconnect" }, () => {
		showMsg("Disconnected.");
		refresh();
	});
});

$("startBtn").addEventListener("click", () => {
	chrome.runtime.sendMessage({ action: "start" }, (res) => {
		if (res && res.ok) showMsg("Recording started.");
		else showMsg("Could not start: " + ((res && res.error) || "unknown error"));
		refresh();
	});
});

$("stopBtn").addEventListener("click", () => {
	chrome.runtime.sendMessage({ action: "stop" }, (res) => {
		if (res && res.filename) showMsg("Downloaded " + res.filename);
		else showMsg("Stop failed: " + ((res && res.error) || "unknown error"));
		refresh();
	});
});

$("downloadBtn").addEventListener("click", () => {
	chrome.runtime.sendMessage({ action: "download" }, (res) => {
		if (res && res.filename) showMsg("Downloaded " + res.filename);
		else showMsg("Download failed: " + ((res && res.error) || "unknown error"));
	});
});

$("clearBtn").addEventListener("click", () => {
	chrome.runtime.sendMessage({ action: "clear" }, () => {
		showMsg("Log cleared.");
		refresh();
	});
});

$("streamBox").addEventListener("change", () => {
	chrome.runtime.sendMessage({ action: "getState" }, () => {});
	// Streaming is toggled by the agent (network.stream command); the box
	// shows the current state and reminds the user it exists.
	showMsg("Live streaming is controlled by your AI (network.stream).");
	refresh();
});

refresh();
setInterval(refresh, 1000);

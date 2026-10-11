// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H — (6) Live mission dashboard.
 * snapshot() returns the live board state as JSON; renderPage() turns it
 * into a self-contained HTML page Yaakov can open on his phone.
 * The page polls snapshot() through the tunnel relay for live updates.
 */

const Store = require("./store.js");
const Model = require("./model.js");

async function snapshot(config) {
	const projects = await Store.listProjects(config);
	const byProject = {};
	const byStatus = { open: 0, claimed: 0, active: 0, paused: 0, complete: 0, failed: 0 };
	const agents = {};
	let total = 0;
	for (const project of projects) {
		const missions = await Store.listMissions(config, project);
		total += missions.length;
		byProject[project] = {
			total: missions.length,
			byStatus: {},
			missions: missions.slice(0, 50).map(m => ({
				missionId: m.missionId,
				title: m.title,
				status: m.status,
				assignee: m.assignee,
				progress: m.progress,
				updatedAt: m.updatedAt,
				tags: m.tags
			}))
		};
		for (const m of missions) {
			byStatus[m.status] = (byStatus[m.status] || 0) + 1;
			byProject[project].byStatus[m.status] = (byProject[project].byStatus[m.status] || 0) + 1;
			if (m.assignee && (m.status === "claimed" || m.status === "active")) {
				agents[m.assignee] = agents[m.assignee] || { agent: m.assignee, missions: [] };
				agents[m.assignee].missions.push({ missionId: m.missionId, title: m.title, status: m.status, progress: m.progress.percent });
			}
		}
	}
	const schedules = await Store.listSchedules(config).catch(() => []);
	return {
		at: Model.stamp(),
		total,
		byStatus,
		byProject,
		agents: Object.values(agents),
		schedules: schedules.map(s => ({ scheduleId: s.scheduleId, name: s.name, active: s.active, nextRunAt: s.nextRunAt, runCount: s.runCount })),
		recentActivity: await Store.readActivity(config, 40)
	};
}

const DASHBOARD_CSS = `
:root {
	--bg: #0f141b;
	--bg-soft: #18202b;
	--card: #1c2634;
	--ink: #eef3fa;
	--ink-dim: #9fb0c7;
	--line: #2c3a4e;
	--accent: #e8b64c;
	--accent-ink: #1a1206;
	--good: #58c98a;
	--bad: #e56b6b;
	--info: #5aa9e6;
	--warn: #e8b64c;
}
@media (prefers-color-scheme: light) {
	:root {
		--bg: #f4f1ea;
		--bg-soft: #ece7da;
		--card: #ffffff;
		--ink: #1d2733;
		--ink-dim: #5a6b80;
		--line: #d8d0bd;
		--accent: #b8860b;
		--accent-ink: #ffffff;
		--good: #1e7a4c;
		--bad: #b23b3b;
		--info: #1f6fb2;
		--warn: #8a6d1a;
	}
}
* { box-sizing: border-box; }
body {
	margin: 0;
	padding: 16px;
	background: var(--bg);
	color: var(--ink);
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
h1 { color: var(--ink); font-size: 22px; margin: 0 0 4px 0; }
.sub { color: var(--ink-dim); font-size: 13px; margin: 0 0 16px 0; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.card {
	background: var(--card);
	border: 1px solid var(--line);
	border-radius: 10px;
	padding: 12px 14px;
	color: var(--ink);
}
.card h2 { color: var(--ink); font-size: 15px; margin: 0 0 8px 0; }
.stat { color: var(--ink-dim); font-size: 13px; margin: 2px 0; }
.stat b { color: var(--ink); }
.pill {
	display: inline-block;
	padding: 2px 10px;
	border-radius: 999px;
	font-size: 12px;
	font-weight: 600;
	color: var(--ink);
	background: var(--bg-soft);
	border: 1px solid var(--line);
	margin: 2px 4px 2px 0;
}
.pill.open { color: var(--info); border-color: var(--info); }
.pill.claimed { color: var(--warn); border-color: var(--warn); }
.pill.active { color: var(--good); border-color: var(--good); }
.pill.paused { color: var(--ink-dim); border-color: var(--ink-dim); }
.pill.complete { color: var(--good); border-color: var(--good); }
.pill.failed { color: var(--bad); border-color: var(--bad); }
.mission { color: var(--ink); font-size: 13px; padding: 6px 0; border-top: 1px solid var(--line); }
.mission .t { color: var(--ink); font-weight: 600; }
.mission .m { color: var(--ink-dim); font-size: 12px; }
.toolbar { display: flex; gap: 8px; margin: 0 0 16px 0; flex-wrap: wrap; }
button {
	background: var(--accent);
	color: var(--accent-ink);
	border: 1px solid var(--accent);
	border-radius: 8px;
	padding: 8px 14px;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
}
button:hover { filter: brightness(1.08); }
button:focus { outline: 2px solid var(--info); outline-offset: 2px; }
button:active { filter: brightness(0.94); }
button:disabled { opacity: 0.45; cursor: not-allowed; filter: none; color: var(--accent-ink); }
button.ghost {
	background: transparent;
	color: var(--ink);
	border: 1px solid var(--line);
}
button.ghost:hover { background: var(--bg-soft); }
button.ghost:focus { outline: 2px solid var(--info); outline-offset: 2px; }
button.ghost:active { background: var(--line); }
button.ghost:disabled { opacity: 0.45; cursor: not-allowed; background: transparent; color: var(--ink); }
.feed { color: var(--ink-dim); font-size: 12px; }
.feed div { padding: 4px 0; border-top: 1px solid var(--line); }
.feed b { color: var(--ink); }
a { color: var(--info); }
a:hover { color: var(--ink); }
a:focus { outline: 2px solid var(--info); outline-offset: 2px; }
a:active { color: var(--accent); }
`;

function escapeHtml(value) {
	return String(value == null ? "" : value)
		.replace(/&/g, "&amp;").replace(/</g, "&lt;")
		.replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function renderPage(config) {
	const snap = await snapshot(config);
	const projectCards = Object.entries(snap.byProject).map(([name, p]) => {
		const pills = Object.entries(p.byStatus).map(([s, n]) => `<span class="pill ${s}">${s}: ${n}</span>`).join("");
		const missions = p.missions.map(m =>
			`<div class="mission"><span class="t">${escapeHtml(m.title)}</span> <span class="pill ${m.status}">${m.status}</span><div class="m">${escapeHtml(m.missionId)} · ${m.progress.percent}% · ${escapeHtml(m.assignee || "unassigned")} · ${escapeHtml(m.updatedAt)}</div></div>`
		).join("");
		return `<div class="card"><h2>${escapeHtml(name)}</h2><div class="stat">Total missions: <b>${p.total}</b></div><div>${pills}</div>${missions}</div>`;
	}).join("");
	const agentCards = snap.agents.map(a =>
		`<div class="card"><h2>${escapeHtml(a.agent)}</h2>${a.missions.map(m => `<div class="mission"><span class="t">${escapeHtml(m.title)}</span> <span class="pill ${m.status}">${m.status}</span><div class="m">${m.progress}%</div></div>`).join("")}</div>`
	).join("");
	const feed = snap.recentActivity.slice().reverse().map(e =>
		`<div><b>${escapeHtml(e.kind)}</b> ${escapeHtml(e.missionId || e.scheduleId || "")} <span>${escapeHtml(e.at || "")}</span></div>`
	).join("");
	const summaryPills = Object.entries(snap.byStatus).map(([s, n]) => `<span class="pill ${s}">${s}: ${n}</span>`).join("");
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Awtsmoos Mission Board</title>
<style>${DASHBOARD_CSS}</style>
</head>
<body>
<h1>\u2726 Awtsmoos Mission Board</h1>
<p class="sub">Live at ${escapeHtml(snap.at)} · ${snap.total} missions · refreshes through the tunnel relay</p>
<div class="toolbar">
<button id="refreshBtn" type="button">Refresh now</button>
<button id="openFilter" class="ghost" type="button">Show open only</button>
<button id="allFilter" class="ghost" type="button">Show all</button>
</div>
<div class="card" style="margin-bottom:12px"><h2>Fleet status</h2><div>${summaryPills}</div></div>
<h2 style="color:var(--ink)">Projects</h2>
<div class="grid" id="projects">${projectCards}</div>
<h2 style="color:var(--ink);margin-top:16px">Active agents</h2>
<div class="grid">${agentCards || '<div class="card"><div class="stat">No agents holding missions right now.</div></div>'}</div>
<h2 style="color:var(--ink);margin-top:16px">Recent activity</h2>
<div class="card"><div class="feed">${feed || "No activity yet."}</div></div>
<script>
document.getElementById("refreshBtn").addEventListener("click", function () { location.reload(); });
var openOnly = false;
document.getElementById("openFilter").addEventListener("click", function () {
	openOnly = true;
	document.querySelectorAll(".mission").forEach(function (el) {
		el.style.display = el.querySelector(".pill.open") ? "" : "none";
	});
});
document.getElementById("allFilter").addEventListener("click", function () {
	openOnly = false;
	document.querySelectorAll(".mission").forEach(function (el) { el.style.display = ""; });
});
</script>
</body>
</html>`;
}

module.exports = { snapshot, renderPage, DASHBOARD_CSS };

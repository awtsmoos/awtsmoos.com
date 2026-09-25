//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveNewProject
 * @description
 * "Start a new coding project" scaffolder. Pure logic over injectable filesystem
 * functions ({ createFolder, writeFile, exists? }), so it is fully unit-testable
 * with mocks and needs no network. A thin adapter at the bottom wires it to the
 * real drive API facade.
 *
 * Idempotent: re-running scaffoldProject on an existing project folder keeps
 * every file the user already touched and only fills in missing starters.
 */

/** Starter templates. Each maps a relative file path to its starter content. */
export const PROJECT_TEMPLATES = Object.freeze({
	'static-html': {
		'index.html': ({ name }) => `<!DOCTYPE html>
<!--B"H-->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(name)}</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<main>
<h1>${escapeHtml(name)}</h1>
<p>A new Awtsmoos coding project. Edit <code>index.html</code>, <code>styles.css</code>, and <code>app.js</code> — then preview.</p>
</main>
<script src="app.js"></script>
</body>
</html>
`,
		'styles.css': () => `:root { color-scheme: light dark; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; line-height: 1.6; }
main { max-width: 44rem; margin: 0 auto; padding: 2rem 1.25rem; }
h1 { letter-spacing: -0.02em; }
`,
		'app.js': () => `//B"H
// Starter script — runs in the sandboxed preview.
document.addEventListener('DOMContentLoaded', () => {
	console.log('B"H — project ready');
});
`,
		'README.md': ({ name }) => `# ${name}

A new Awtsmoos coding project.

- \`index.html\` — page source (preview auto-links the sibling \`styles.css\` and \`app.js\`)
- \`styles.css\` — styles
- \`app.js\` — client script (runs sandboxed in preview)

Open the folder in the project workspace to preview, share, and publish.
`
	}
});

function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>"']/g, ch => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	}[ch]));
}

function slugify(name) {
	const slug = String(name || '')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 64);
	if (!slug) throw new Error('Project name must contain at least one letter or digit');
	return slug;
}

function joinPath(parent, child) {
	const raw = String(parent || '');
	const clean = raw.replace(/\/+$/g, '');
	const base = clean || (raw.startsWith('/') ? '/' : '');
	if (!base) return String(child);
	return `${base}/${child}`.replace(/\/{2,}/g, '/');
}

/**
 * Scaffolds a new coding project folder with starter files.
 * @param {{name:string, parentFolder?:string, template?:string, fs:{createFolder:Function, writeFile:Function, exists?:Function}}} options
 * @returns {Promise<{projectPath:string, created:string[], skipped:string[], files:string[]}>}
 */
export async function scaffoldProject({ name, parentFolder = '/', template = 'static-html', fs }) {
	if (!fs || typeof fs.createFolder !== 'function' || typeof fs.writeFile !== 'function') {
		throw new Error('scaffoldProject needs fs.createFolder and fs.writeFile');
	}
	const starter = PROJECT_TEMPLATES[template];
	if (!starter) {
		throw new Error(`Unknown project template "${template}" (known: ${Object.keys(PROJECT_TEMPLATES).join(', ')})`);
	}
	const projectPath = joinPath(parentFolder, slugify(name));
	const created = [];
	const skipped = [];
	const exists = typeof fs.exists === 'function'
		? path => fs.exists(path)
		: async () => false;
	await ensureFolder(fs, projectPath, created);
	const context = { name: String(name).trim() };
	for (const [relative, render] of Object.entries(starter)) {
		const filePath = joinPath(projectPath, relative);
		if (await exists(filePath)) {
			skipped.push(filePath);
			continue;
		}
		await fs.writeFile(filePath, render(context));
		created.push(filePath);
	}
	return {
		projectPath,
		created,
		skipped,
		files: Object.keys(starter).map(relative => joinPath(projectPath, relative))
	};
}

async function ensureFolder(fs, path, created) {
	try {
		await fs.createFolder(path);
		created.push(path);
	} catch (error) {
		if (isAlreadyExists(error)) return;
		throw error;
	}
}

function isAlreadyExists(error) {
	const message = String(error?.message || error || '').toLowerCase();
	return message.includes('already exists') || message.includes('eexist') || error?.code === 'EEXIST';
}

/**
 * Thin adapter wiring the scaffolder to the drive API facade
 * (js/api.js: createEntry, listEntriesAt, getEntryContent).
 * @param {{createEntry:Function, listEntriesAt:Function}} api
 */
export function driveFsAdapter(api) {
	return {
		async createFolder(path) {
			await api.createEntry({ type: 'folder', path });
		},
		async writeFile(path, content) {
			await api.createEntry({ type: 'file', path, content });
		},
		async exists(path) {
			const parent = path.split('/').slice(0, -1).join('/') || '/';
			const name = path.split('/').pop();
			try {
				const listing = await api.listEntriesAt(parent);
				const entries = Array.isArray(listing) ? listing : listing?.entries || [];
				return entries.some(entry => entry?.name === name || entry?.path === path);
			} catch {
				return false;
			}
		}
	};
}

/**
 * Convenience: scaffold a project directly against the drive API facade.
 * @param {object} api drive api facade (js/api.js)
 * @param {{name:string, parentFolder?:string, template?:string}} options
 */
export function scaffoldDriveProject(api, options) {
	return scaffoldProject({ ...options, fs: driveFsAdapter(api) });
}

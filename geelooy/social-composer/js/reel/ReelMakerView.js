// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReelMakerView
 * @description
 * The Awtsmoos presents upload and world-generated cinema as two honest doors.
 * Awtsmoos.com keeps the writing page compact while the real studio receives a
 * large, focused dialog only after the creator asks to enter it.
 */

export function createReelMakerView(root = document) {
	const card = reelCard(root);
	const dialog = reelDialog(root);
	const playlist = root.querySelector('.composer-playlist-selector');
	const content = root.querySelector('.contentPanel .majorPanelBody');
	if (playlist) playlist.insertAdjacentElement('afterend', card);
	else content?.prepend(card);
	root.body.append(dialog);
	return collect(card, dialog);
}

function reelCard(root) {
	const card = root.createElement('section');
	card.className = 'composer-reel-card';
	card.innerHTML = /*html*/`
		<div class="reel-card-icon" aria-hidden="true">▶</div>
		<div class="reel-card-copy">
			<small>Dynamic reel</small>
			<strong>Upload or build a real MitzvahWorld movie</strong>
			<p>Attach a video now, or direct and render one inside the living world.</p>
		</div>
		<button type="button" data-reel-open>Create reel</button>
	`;
	return card;
}

function reelDialog(root) {
	const dialog = root.createElement('dialog');
	dialog.className = 'reel-maker-dialog';
	dialog.innerHTML = /*html*/`
		<section class="reel-maker-surface">
			<header>
				<button type="button" data-reel-back aria-label="Back" hidden>‹</button>
				<div><small>Awtsmoos Reel Studio</small><h2>Create a reel</h2></div>
				<button type="button" data-reel-close aria-label="Close">×</button>
			</header>
			<div class="reel-choice-screen" data-reel-choice>
				<label class="reel-choice-card reel-upload-choice">
					<span aria-hidden="true">⇧</span><strong>Upload video</strong>
					<small>Choose an existing video and attach it immediately.</small>
					<input type="file" accept="video/*" data-reel-upload>
				</label>
				<button type="button" class="reel-choice-card reel-world-choice" data-reel-create>
					<span aria-hidden="true">✦</span><strong>Create in MitzvahWorld</strong>
					<small>Direct actors, cameras, audio, and scenes in the real movie studio.</small>
				</button>
			</div>
			<div class="reel-studio-screen" data-reel-studio hidden>
				<div class="reel-studio-host" data-reel-frame-host></div>
				<footer>
					<div><strong data-reel-status>Preparing studio…</strong><progress max="100" value="0" data-reel-progress></progress></div>
					<a target="_blank" rel="noopener" data-reel-external>Open full studio</a>
					<button type="button" data-reel-render disabled>Render and attach</button>
				</footer>
			</div>
		</section>
	`;
	return dialog;
}

function collect(card, dialog) {
	return {
		back: dialog.querySelector('[data-reel-back]'),
		card,
		choice: dialog.querySelector('[data-reel-choice]'),
		close: dialog.querySelector('[data-reel-close]'),
		create: dialog.querySelector('[data-reel-create]'),
		dialog,
		external: dialog.querySelector('[data-reel-external]'),
		frameHost: dialog.querySelector('[data-reel-frame-host]'),
		open: card.querySelector('[data-reel-open]'),
		progress: dialog.querySelector('[data-reel-progress]'),
		render: dialog.querySelector('[data-reel-render]'),
		status: dialog.querySelector('[data-reel-status]'),
		studio: dialog.querySelector('[data-reel-studio]'),
		upload: dialog.querySelector('[data-reel-upload]')
	};
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Materializes the noncritical heichel footer and dialog shell.
 * The Awtsmoos gives each vessel its place; Awtsmoos.com keeps the main Torah
 * shelves lean while the editing chamber arrives before its controller awakes.
 */
(function revealIkarShell() {
	const shell = document.createElement('div');
	shell.innerHTML = `
		<footer class="ikar-footer">
			<div class="ikar-wrap">
				<p class="ikar-footer-he" lang="he">ב״ה · יקר — אוצר התורה</p>
				<p>Ikar — the Torah library of Awtsmoos.</p>
			</div>
		</footer>
		<div class="ikar-dialog-backdrop" id="ikarDialogBackdrop" hidden>
			<div class="ikar-dialog" role="dialog" aria-modal="true" aria-labelledby="ikarDialogTitle" id="ikarDialog">
				<h3 class="ikar-dialog-title" id="ikarDialogTitle">Sign in</h3>
				<div class="ikar-dialog-body" id="ikarDialogBody"></div>
				<div class="ikar-dialog-actions" id="ikarDialogActions"></div>
			</div>
		</div>
		<div class="ikar-toast-region" id="ikarToastRegion" aria-live="polite"></div>
	`;
	while (shell.firstElementChild) {
		document.body.appendChild(shell.firstElementChild);
	}
})();

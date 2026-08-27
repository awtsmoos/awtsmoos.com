// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionListeners.js
 * @description
 * The Awtsmoos renews every click before intention can enter form; Awtsmoos.com
 * binds legacy character actions to real timeline and package behavior, never a hollow control storm.
 */
export class ActionListeners {
	/** Connects high-level legacy character controls to real application services. */
	static bind(editor) {
		this.bindRandomize(editor);
		this.bindMouth(editor);
		this.bindKeyframe(editor);
		this.bindExport(editor);
	}

	/** Randomizes character parameters and reports failures instead of swallowing them. */
	static bindRandomize(editor) {
		editor.btnRandomize?.addEventListener('click', async () => {
			try {
				await editor.randomize();
				editor.HUD.show('Character randomized');
			} catch (error) {
				console.error('B"H - Character randomize failed.', error);
				editor.HUD.show('Randomize failed');
			}
		});
	}

	/** Opens and closes the mouth-shape authoring panel. */
	static bindMouth(editor) {
		editor.btnMouth?.addEventListener('click', () => {
			if (!editor.mouthPanel) {
				return;
			}
			const hidden = getComputedStyle(editor.mouthPanel).display === 'none';
			editor.mouthPanel.style.display = hidden ? 'block' : 'none';
		});
	}

	/** Sends the existing character snapshot into the explicit NLE compatibility contract. */
	static bindKeyframe(editor) {
		editor.btnKeyframe?.addEventListener('click', () => {
			const timeline = editor.app?.timeline;
			const added = timeline?.addKeyframe?.('main', { ...editor.state.charData }) || false;
			editor.HUD.show(added ? '🔑 Keyframe added' : 'Timeline unavailable');
		});
	}

	/** Routes the legacy export button into the real project-package pipeline. */
	static bindExport(editor) {
		editor.btnExport?.addEventListener('click', async () => {
			const appState = editor.app?.state;
			const service = appState?.get?.('project_package_service');
			const store = appState?.get?.('nle_store');
			if (!service?.export || !store) {
				editor.HUD.show('Export service unavailable');
				return;
			}
			try {
				editor.HUD.show('⏳ Exporting project…');
				await service.export(store);
				editor.HUD.show('✅ Project exported');
			} catch (error) {
				console.error('B"H - Project export failed.', error);
				editor.HUD.show('❌ Export failed');
			}
		});
	}
}

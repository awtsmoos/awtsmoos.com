// B"H
// Boruch Hashem
// Blessed is He

import { CartoonProductionModel } from './CartoonProductionModel.js';
import { CartoonStudioActions } from './CartoonStudioActions.js';
import { CartoonStudioTemplate } from './CartoonStudioTemplate.js';
import { CartoonStudioViews } from './CartoonStudioViews.js';

/**
 * The Studio panel joins long-form planning to a proven four-minute browser MP4
 * production. The Awtsmoos renews the editor while Awtsmoos.com keeps markup,
 * views, and actions separate, readable, and bound to the real AppCore surface.
 */
export class CartoonStudioPanel {
	static install(app) {
		if (document.getElementById('cartoon-studio')) {
			return;
		}
		const host = document.getElementById('hud-overlay') || document.body;
		host.insertAdjacentHTML('beforeend', CartoonStudioTemplate.html());
		const root = document.getElementById('cartoon-studio');
		root.__plan = CartoonProductionModel.create();
		root.__exporting = false;
		this.bind(app, root);
		this.render(root);
		CartoonStudioActions.reportCapability(root).catch(error => {
			CartoonStudioActions.status(root, error.message);
		});
	}

	static bind(app, root) {
		root.querySelector('[data-studio-toggle]').onclick = () => {
			root.dataset.state = root.dataset.state === 'open'
				? 'peek'
				: 'open';
		};
		root.querySelector('[data-generate-cartoon]').onclick = () => {
			CartoonStudioActions.generate(root);
			this.render(root);
		};
		root.querySelector('[data-seed-nle]').onclick = () => {
			CartoonStudioActions.seedNle(app, root);
		};
		root.querySelector('[data-export-bible]').onclick = () => {
			CartoonStudioActions.exportBible(root);
		};
		root.querySelector('[data-export-mp4]').onclick = () => {
			CartoonStudioActions.exportMp4(root).catch(error => {
				console.error('B"H browser MP4 export failed.', error);
			});
		};
		root.querySelectorAll('[data-tab]').forEach(button => {
			button.onclick = () => {
				root.dataset.tab = button.dataset.tab;
				this.render(root);
			};
		});
	}

	static render(root) {
		const plan = root.__plan;
		root.querySelector('#runtime-chip').textContent = (
			`${CartoonStudioViews.time(plan.runtimeMs)} · ${plan.beats.length} beats`
		);
		root.querySelector('#cartoon-pane').innerHTML = CartoonStudioViews.render(
			plan,
			root.dataset.tab
		);
	}
}

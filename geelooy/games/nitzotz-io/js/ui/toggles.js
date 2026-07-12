// B"H
import { saveGame } from '../save.js';

/** Install settings buttons with immediate persistence. */
export function bindToggles(world, dom) {
	dom.haptic.onclick = () => toggle(world, 'haptics');
	dom.postfx.onclick = () => toggle(world, 'postfx');
	for (const button of dom.perf) button.onclick = () => setPerf(world, button.dataset.perf);
}

export function renderToggles(world, dom) {
	dom.haptic.classList.toggle('active', Boolean(world.save.haptics));
	dom.postfx.classList.toggle('active', Boolean(world.save.postfx));
	for (const button of dom.perf) button.classList.toggle('active', button.dataset.perf === world.save.perf);
}

function toggle(world, key) {
	world.save[key] = !world.save[key];
	saveGame(world.save);
}

function setPerf(world, perf) {
	world.save.perf = perf;
	saveGame(world.save);
	location.reload();
}

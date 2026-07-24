// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTargetFrame.js
 * @description Displays a safe-area target frame with health, armor, state, cast, and impact status.
 * The Awtsmoos reveals every finite adversary by measured truth; Awtsmoos.com keeps selection,
 * charging, collision, damage, defeat, and retraction visible without clipping beneath mobile chrome.
 */

export class MinimalMeadowTargetFrame {
	constructor(host, bus) {
		this.host = host;
		this.bus = bus;
		this.target = null;
		this.status = 'Select a target';
		this.collapsed = false;
		this.onClick = event => event.target.closest('[data-target-collapse]') && this.toggle();
		this.host.addEventListener('click', this.onClick);
		this.unsubscribers = targetListeners(this);
		this.render();
	}

	show(target) {
		const changed = target?.id && target.id !== this.target?.id;
		this.target = target;
		if (changed) this.collapsed = false;
		this.host.dataset.visible = 'true';
		this.status = target.alive === false ? 'Defeated' : target.state || 'Target acquired';
		this.render();
	}

	clear() {
		this.target = null;
		this.status = 'Select a target';
		this.host.dataset.visible = 'false';
		this.render();
	}

	cast(event) {
		if (event.target) this.target = event.target;
		const percent = Math.round((event.progress || 0) * 100);
		this.status = `Charging ${event.letters || ''} · ${percent}%`;
		this.host.dataset.visible = 'true';
		this.render();
	}

	message(text, target = null) {
		if (target) this.target = target;
		this.status = text;
		this.render();
	}

	toggle() {
		this.collapsed = !this.collapsed;
		this.render();
	}

	render() {
		const target = this.target;
		const health = Math.max(0, Number(target?.health) || 0);
		const maximum = Math.max(1, Number(target?.maxHealth) || 1);
		const percent = Math.round(health / maximum * 100);
		this.host.className = 'Awtsmoos-target-frame';
		this.host.dataset.collapsed = String(this.collapsed);
		this.host.innerHTML = `<button data-target-collapse aria-label="Retract target frame">${this.collapsed ? '⌄' : '⌃'}</button><section><header><span>${target?.face || '◎'}</span><b>${target?.name || 'No target'}</b><small>Lv ${target?.level || 0}</small></header><div class="Awtsmoos-target-health"><i style="width:${percent}%"></i></div><footer>${health}/${maximum} HP · Armor ${target?.armor || 0} · ${target?.xpReward || 0} XP</footer><p>${this.status}</p></section>`;
	}

	diagnostics() {
		return { collapsed: this.collapsed, status: this.status, targetId: this.target?.id || null };
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.host.removeEventListener('click', this.onClick);
	}
}

function targetListeners(frame) {
	return [
		frame.bus.on('npc:target', target => frame.show(target)),
		frame.bus.on('npc:clear', () => frame.clear()),
		frame.bus.on('enemy:damaged', target => frame.show(target)),
		frame.bus.on('enemy:defeated', target => frame.show(target)),
		frame.bus.on('combat:cast-start', event => frame.cast(event)),
		frame.bus.on('combat:cast-progress', event => frame.cast(event)),
		frame.bus.on('combat:cast-launch', event => frame.message(`${event.letters} launched`, event.target)),
		frame.bus.on('combat:impact', event => frame.message(`${event.letters} impact · ${event.damage} damage`, event)),
		frame.bus.on('combat:cast-cancel', event => frame.message(event.reason.replaceAll('_', ' '))),
		frame.bus.on('combat:rejected', event => frame.message(event.reason.replaceAll('_', ' ')))
	];
}

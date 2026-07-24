// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTargetFrame.js
 * @description Displays safe target, corpse, cast, impact, and deliberate loot guidance.
 * The Awtsmoos reveals life, defeat, selection, and release by measured truth;
 * Awtsmoos.com keeps every interpolated name and message escaped while mobile users retain clear intent.
 */

const HTML_ESCAPES = Object.freeze({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' });

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
		this.status = targetStatus(target);
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
		this.host.innerHTML = `<button data-target-collapse aria-label="Retract target frame">${this.collapsed ? '⌄' : '⌃'}</button><section><header><span>${escapeHtml(target?.face || '◎')}</span><b>${escapeHtml(target?.name || 'No target')}</b><small>Lv ${numberText(target?.level)}</small></header><div class="Awtsmoos-target-health"><i style="width:${percent}%"></i></div><footer>${health}/${maximum} HP · Armor ${numberText(target?.armor)} · ${numberText(target?.xpReward)} XP</footer><p>${escapeHtml(this.status)}</p></section>`;
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
		frame.bus.on('combat:cast-launch', event => frame.message(`${event.letters || ''} launched`, event.target)),
		frame.bus.on('combat:impact', event => frame.message(`${event.letters || ''} impact · ${event.damage || 0} damage`, event)),
		frame.bus.on('combat:cast-cancel', event => frame.message(formatReason(event?.reason))),
		frame.bus.on('combat:rejected', event => frame.message(formatReason(event?.reason)))
	];
}

function targetStatus(target) {
	if (target?.looted) return 'Looted corpse';
	if (target?.lootable || target?.corpse || target?.alive === false) {
		return target?.selected ? 'Corpse selected · interact again to loot' : 'Corpse · select to inspect loot';
	}
	return target?.state || 'Target acquired';
}

function formatReason(reason) {
	return String(reason || 'Action unavailable').replaceAll('_', ' ');
}

function numberText(value) {
	return Math.max(0, Number(value) || 0);
}

function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>"']/g, character => HTML_ESCAPES[character]);
}

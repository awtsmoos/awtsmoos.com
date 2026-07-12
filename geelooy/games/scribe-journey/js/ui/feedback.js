// B"H

export function showToast(message, type = 'info') {
	const container = document.getElementById('toast-container');
	if (!container) return;
	const toast = document.createElement('div');
	toast.className = `toast toast-${type}`;
	toast.textContent = message;
	container.appendChild(toast);
	window.setTimeout(() => toast.remove(), 3200);
}

export function showFloatingText(effect = {}) {
	const container = document.getElementById('gameContainer');
	if (!container) return;
	const element = document.createElement('div');
	element.className = `floating-text ${effect.style || ''}`;
	element.textContent = effect.text || '';
	element.dataset.anchor = effect.x || 'center';
	container.appendChild(element);
	window.setTimeout(() => element.remove(), 900);
}

export function pulseScreen() {
	const container = document.getElementById('gameContainer');
	if (!container) return;
	container.classList.remove('screen-shake');
	void container.offsetWidth;
	container.classList.add('screen-shake');
}

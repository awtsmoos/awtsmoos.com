// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProfileReadingStats
 * @description
 * Displays reading analytics on the user profile. Respects privacy settings —
 * only shows if the profile owner allows it. Shows total posts read, hours,
 * streak, favorite series, and recently read posts.
 */

class ProfileReadingStats {
	constructor({ container, userId, viewerId, apiBase = '/api/social' } = {}) {
		this.container = typeof container === 'string'
			? document.querySelector(container)
			: container;
		this.userId = userId;
		this.viewerId = viewerId;
		this.apiBase = apiBase;
	}

	async load() {
		if (!this.container || !this.userId) return;

		try {
			// B"H social fix 3 (defect 7): the two fetches had NO timeout —
			// if the reading API hung, Promise.all never settled and no
			// message ever rendered (the "could not be loaded" text below
			// only runs in the catch). Bound to 8s so a hung API renders
			// the honest failure message instead of a blank tab.
			const controller = new AbortController();
			const watchdog = setTimeout(() => controller.abort(), 8000);
			let statsRes, recentRes;
			try {
				[statsRes, recentRes] = await Promise.all([
					fetch(`${this.apiBase}/reading/stats/${encodeURIComponent(this.userId)}`, { credentials: 'same-origin', signal: controller.signal }),
					fetch(`${this.apiBase}/reading/recent/${encodeURIComponent(this.userId)}?limit=5`, { credentials: 'same-origin', signal: controller.signal })
				]);
			} finally {
				clearTimeout(watchdog);
			}

			const statsData = await statsRes.json();
			const recentData = await recentRes.json();

			// B"H social fix 2: privacy-restricted is a real answer, not an
			// empty tab. Say so instead of hiding the container (which left
			// the Reading tab as a bare heading with no content at all).
			if (statsData?.error?.code === 'PRIVACY_RESTRICTED') {
				this.container.innerHTML = `
					<div class="pd-reading-empty">
						<p>Reading activity is private.</p>
					</div>`;
				return;
			}

			this.render(statsData, recentData?.recent || []);
		} catch {
			// B"H social fix 2: a failed load is still an answer — say so
			// instead of hiding the container and leaving a blank tab.
			this.container.innerHTML = `
				<div class="pd-reading-empty">
					<p>Reading activity could not be loaded.</p>
				</div>`;
		}
	}

	render(stats, recent) {
		if (!stats || stats.empty) {
			this.container.innerHTML = `
				<div class="pd-reading-empty">
					<p>No reading activity yet. Start exploring the Torah!</p>
				</div>`;
			return;
		}

		const hours = stats.totalHours || 0;
		const streak = stats.streakDays || 0;
		const posts = stats.totalPostsRead || 0;
		const completed = stats.postsCompleted || 0;

		this.container.innerHTML = `
			<div class="pd-reading-stats">
				<h3 class="pd-reading-title">Reading Journey</h3>
				<div class="pd-reading-grid">
					<div class="pd-reading-stat">
						<strong>${posts}</strong>
						<span>Posts read</span>
					</div>
					<div class="pd-reading-stat">
						<strong>${hours}h</strong>
						<span>Reading time</span>
					</div>
					<div class="pd-reading-stat">
						<strong>${streak}🔥</strong>
						<span>Day streak</span>
					</div>
					<div class="pd-reading-stat">
						<strong>${completed}</strong>
						<span>Completed</span>
					</div>
				</div>
				${stats.favoriteSeries ? `
					<p class="pd-reading-favorite">
						Favorite: <strong>${this.escapeHtml(stats.favoriteSeries)}</strong>
					</p>` : ''}
				${recent.length > 0 ? `
					<div class="pd-reading-recent">
						<h4>Recently read</h4>
						<ul>
							${recent.map(r => `
								<li>
									<span class="pd-reading-post">${this.escapeHtml(r.postId.slice(0, 40))}</span>
									<span class="pd-reading-time">${this.formatTime(r.activeSeconds)}</span>
								</li>`).join('')}
						</ul>
					</div>` : ''}
			</div>`;
	}

	formatTime(seconds) {
		if (seconds < 60) return `${seconds}s`;
		const mins = Math.round(seconds / 60);
		if (mins < 60) return `${mins}m`;
		const hours = Math.floor(mins / 60);
		return `${hours}h ${mins % 60}m`;
	}

	escapeHtml(str) {
		const div = document.createElement('div');
		div.textContent = str;
		return div.innerHTML;
	}
}

/**
 * Privacy settings component for reading analytics.
 */
class ReadingPrivacySettings {
	constructor({ container, apiBase = '/api/social' } = {}) {
		this.container = typeof container === 'string'
			? document.querySelector(container)
			: container;
		this.apiBase = apiBase;
		this.currentLevel = 'private';
	}

	async load() {
		if (!this.container) return;
		try {
			const res = await fetch(`${this.apiBase}/reading/privacy`, { credentials: 'same-origin' });
			const data = await res.json();
			this.currentLevel = data.level || 'private';
			this.render();
		} catch {
			this.render(); // Render with default on error
		}
	}

	render() {
		const levels = [
			{ value: 'private', label: 'Private', desc: 'Only you can see your reading activity' },
			{ value: 'friends', label: 'Friends only', desc: 'Your friends can see your reading stats' },
			{ value: 'public', label: 'Public', desc: 'Anyone can see your reading stats on your profile' }
		];

		this.container.innerHTML = `
			<div class="pd-privacy-settings">
				<h3>Reading Privacy</h3>
				<p class="pd-privacy-desc">Choose who can see your reading activity:</p>
				<div class="pd-privacy-options" role="radiogroup" aria-label="Reading privacy">
					${levels.map(l => `
						<label class="pd-privacy-option ${this.currentLevel === l.value ? 'selected' : ''}">
							<input type="radio" name="reading-privacy" value="${l.value}"
								${this.currentLevel === l.value ? 'checked' : ''}>
							<strong>${l.label}</strong>
							<span>${l.desc}</span>
						</label>`).join('')}
				</div>
				<p class="pd-privacy-status" aria-live="polite"></p>
			</div>`;

		this.container.querySelectorAll('input[name="reading-privacy"]').forEach(input => {
			input.addEventListener('change', (e) => this.update(e.target.value));
		});
	}

	async update(level) {
		const status = this.container.querySelector('.pd-privacy-status');
		try {
			const res = await fetch(`${this.apiBase}/reading/privacy`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ level }),
				credentials: 'same-origin'
			});
			const data = await res.json();
			if (data.updated) {
				this.currentLevel = level;
				status.textContent = 'Privacy updated.';
				// Update selected styling
				this.container.querySelectorAll('.pd-privacy-option').forEach(opt => {
					opt.classList.toggle('selected',
						opt.querySelector('input').value === level);
				});
			} else {
				status.textContent = 'Could not update. Try again.';
			}
		} catch {
			status.textContent = 'Could not update. Try again.';
		}
	}
}

if (typeof window !== 'undefined') {
	window.ProfileReadingStats = ProfileReadingStats;
	window.ReadingPrivacySettings = ReadingPrivacySettings;
}
if (typeof module !== 'undefined') {
	module.exports = { ProfileReadingStats, ReadingPrivacySettings };
}

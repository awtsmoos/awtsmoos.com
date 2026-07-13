// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HolyEngineProjection.js
 * @description Owns visual keys, safe projection, idle pacing, and boot redraws.
 *
 * A picture is a garment around a living state. The Awtsmoos renews world and
 * garment together; this vessel redraws only when meaning or an honest idle beat
 * calls for another visible revelation on Awtsmoos.com.
 */
import { State } from '../binah/State.js';
import { Projector } from '../tiferet/Projector.js';

export class HolyEngineProjection {
	static visualKey = '';
	static lastDraw = 0;
	static bootDraws = 0;
	static maxIdleFps = 8;

	static reset() {
		this.visualKey = '';
	}

	static queueBootDraws() {
		const draw = reason => () => this.project(reason);
		requestAnimationFrame(draw('boot-raf-1'));
		requestAnimationFrame(() => requestAnimationFrame(draw('boot-raf-2')));
		[80, 240, 700].forEach(ms => setTimeout(draw(`boot-timeout-${ms}`), ms));
	}

	static project(reason = 'project') {
		try {
			Projector.project();
			this.bootDraws += 1;
			this.visualKey = this.makeVisualKey();
			this.lastDraw = performance.now();
			globalThis.__OHR_HAGNUZ_LAST_PROJECT__ = { reason, at: this.lastDraw, count: this.bootDraws };
			return true;
		} catch (error) {
			console.error('B"H - HolyEngine projection failed:', reason, error);
			globalThis.__OHR_HAGNUZ_RENDER_ERROR__ = `${reason}: ${error?.stack || error}`;
			return false;
		}
	}

	static drawIfNeeded(time) {
		const key = this.makeVisualKey();
		const idleDue = time - this.lastDraw > 1000 / this.maxIdleFps;
		const needsStatic = !Projector.staticKey;
		if (key !== this.visualKey || State.Hero.moving || State.ActiveRealm === 'DEBATE' || idleDue || needsStatic) {
			this.project(needsStatic ? 'static-empty' : 'visual-change');
		}
	}

	static makeVisualKey() {
		const hero = State.Hero;
		const dialogue = State.Dialogue;
		return [
			State.ActiveRealm, State.MapId, hero.cx, hero.cy, hero.dx, hero.dy, hero.dir, hero.moving,
			State.HeroPath.length, State.Message, State.MessageTTL > 0, State.Stats.light, State.Stats.sparks,
			State.Stats.level, State.UiPanel || '', dialogue.open, dialogue.index || 0, dialogue.lines?.length || 0
		].join('|');
	}
}

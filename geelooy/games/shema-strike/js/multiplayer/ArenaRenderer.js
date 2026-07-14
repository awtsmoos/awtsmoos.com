//B"H
// Boruch Hashem
// Blessed is He
/**
 * The arena renderer receives truth but never authors it. The Awtsmoos renews
 * every visible fighter; Awtsmoos.com turns server coordinates, health, stocks,
 * phase, and names into redundant shapes and text on the existing canvas.
 */

const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 540;
const SERVER_WIDTH = 1280;
const SERVER_HEIGHT = 720;
const FIGHTER_WIDTH = 46;
const FIGHTER_HEIGHT = 78;

export class ArenaRenderer {
	constructor(renderer) {
		this.renderer = renderer;
	}

	draw(state, playerId, joinCode) {
		const context = this.renderer.context;
		context.setTransform(this.renderer.pixelRatio, 0, 0, this.renderer.pixelRatio, 0, 0);
		this.drawBackground(context);
		context.save();
		context.scale(VIEW_WIDTH / SERVER_WIDTH, VIEW_HEIGHT / SERVER_HEIGHT);
		this.drawWorld(context, state, playerId);
		context.restore();
		this.drawStatus(context, state, playerId, joinCode);
	}

	drawBackground(context) {
		const gradient = context.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
		gradient.addColorStop(0, "#080b20");
		gradient.addColorStop(1, "#19102d");
		context.fillStyle = gradient;
		context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
		context.fillStyle = "rgba(133, 213, 255, 0.12)";
		for (let index = 0; index < 12; index += 1) {
			context.fillRect(index * 96, 80 + (index % 3) * 35, 34, 260);
		}
	}

	drawWorld(context, state, playerId) {
		context.fillStyle = "#263653";
		context.fillRect(0, state.arena.floorY, SERVER_WIDTH, SERVER_HEIGHT - state.arena.floorY);
		context.fillStyle = "#78d8ef";
		context.fillRect(0, state.arena.floorY, SERVER_WIDTH, 7);
		for (const fighter of state.fighters) {
			this.drawFighter(context, fighter, fighter.id === playerId);
		}
	}

	drawFighter(context, fighter, local) {
		context.fillStyle = local ? "#f6d365" : "#75d7f0";
		context.fillRect(fighter.x, fighter.y, FIGHTER_WIDTH, FIGHTER_HEIGHT);
		context.strokeStyle = "#ffffff";
		context.lineWidth = local ? 5 : 2;
		context.strokeRect(fighter.x, fighter.y, FIGHTER_WIDTH, FIGHTER_HEIGHT);
		context.fillStyle = "#10182d";
		const eyeX = fighter.facing > 0 ? fighter.x + 31 : fighter.x + 9;
		context.fillRect(eyeX, fighter.y + 18, 7, 7);
		if (fighter.attackFrames > 0) {
			context.strokeStyle = "#ffef9a";
			context.lineWidth = 8;
			context.beginPath();
			context.arc(fighter.x + 23, fighter.y + 38, 52, -0.8, 0.8);
			context.stroke();
		}
	}

	drawStatus(context, state, playerId, joinCode) {
		context.font = "700 16px system-ui";
		context.textBaseline = "top";
		context.fillStyle = "#ffffff";
		context.fillText(`ONLINE ARENA ${joinCode}`, 18, 16);
		let y = 46;
		for (const fighter of state.fighters) {
			const marker = fighter.id === playerId ? "YOU · " : "";
			context.fillText(`${marker}${fighter.name}: ${fighter.health} HP · ${fighter.stocks} stocks`, 18, y);
			y += 24;
		}
		const winner = state.fighters.find((fighter) => fighter.id === state.winner);
		const phase = winner ? `${winner.name} wins` : state.phase;
		context.textAlign = "right";
		context.fillText(phase.toUpperCase(), VIEW_WIDTH - 18, 16);
		context.textAlign = "left";
	}
}

// B"H
// js/workers/combat.js
import * as Quests from './quests.js';
import {
	TILE_SIZE,
	formatMoney
} from '../data/database.js';

let BATTLE_STATE = {};

export function getMusagInstance(state,
	source) {
	const base = state.db.musagim[source
		.id];
	if (!base) {
		console.error(
			`Musag ID not found: ${source.id}`
			);
		return null;
	}
	const level = source.level;
	const stats = {
		hp: Math.floor(base
			.baseStats.hp * (1 +
				level / 20)),
		attack: Math.floor(base
			.baseStats.attack *
			(1 + level / 20)),
		defense: Math.floor(base
			.baseStats.defense *
			(1 + level / 20)),
		diligence: Math.floor(base
			.baseStats
			.diligence * (1 +
				level / 20)),
	};
	return {
		...base,
		level,
		id: source.id,
		maxHp: stats.hp,
		currentHp: source.currentHp !==
			undefined ? source
			.currentHp : stats.hp,
		maxKavanah: 20 + Math.floor(
			level / 2),
		currentKavanah: source
			.currentKavanah !==
			undefined ? source
			.currentKavanah : (20 + Math
				.floor(level / 2)),
		stats
	};
}

export function initiate(state,
	opponentData, context, sendUIUpdate
	) {
	const playerInstance =
		getMusagInstance(state, state
			.player.team[0]);
	const opponentInstance =
		getMusagInstance(state,
			opponentData[0]);
	if (!playerInstance || !
		opponentInstance) {
		console.error(
			"Failed to create battle participants."
			);
		return;
	}
	state.battle = BATTLE_STATE = {
		player: playerInstance,
		opponent: opponentInstance,
		turn: 'player',
		log: `A wild ${opponentInstance.name} appeared!`,
		awaitingConfirm: true,
		context
	};
	sendUIUpdate({
		screen: 'battle',
		battle: getBattleUIPayload()
	});
}

export function handleAction(state,
	data, sendUIUpdate, trigger) {
	if (BATTLE_STATE.awaitingConfirm &&
		data.action === 'confirm') {
		BATTLE_STATE.awaitingConfirm =
			false;
		if (BATTLE_STATE.winner) {
			trigger.endBattle(
				BATTLE_STATE
				.winner === 'player'
				);
			return;
		}
		if (BATTLE_STATE.turn ===
			'player') {
			showActionMenu(
			sendUIUpdate);
		} else {
			runOpponentTurn(state,
				sendUIUpdate,
				trigger);
		}
		return;
	}
	if (BATTLE_STATE.awaitingConfirm ||
		BATTLE_STATE.turn !== 'player')
		return;
	switch (data.action) {
		case 'fight':
			showMovesMenu(state,
				sendUIUpdate);
			break;
		case 'back':
			showActionMenu(
			sendUIUpdate);
			break;
		case 'move':
			executeTurn(state, data
				.value, false,
				sendUIUpdate,
				trigger);
			break;
		case 'flee':
			BATTLE_STATE.log =
				"You conceded the debate...";
			BATTLE_STATE.winner =
				'opponent';
			BATTLE_STATE
				.awaitingConfirm = true;
			sendUIUpdate({
				battle: getBattleUIPayload()
			});
			break;
	}
}

function executeTurn(state, moveId,
	isOpponent, sendUIUpdate, trigger) {
	const attacker = isOpponent ?
		BATTLE_STATE.opponent :
		BATTLE_STATE.player;
	const defender = isOpponent ?
		BATTLE_STATE.player :
		BATTLE_STATE.opponent;
	const move = state.db.moves[moveId];
	if (attacker.currentKavanah < move
		.cost) {
		BATTLE_STATE.log =
			`${attacker.name} lacks the Kavanah!`;
		BATTLE_STATE.awaitingConfirm =
			true;
		BATTLE_STATE.turn = isOpponent ?
			'player' : 'opponent';
		sendUIUpdate({
			battle: getBattleUIPayload()
		});
		return;
	}
	attacker.currentKavanah -= move
	.cost;
	const power = move.power || 0;
	let damage = 0;
	if (power > 0) {
		damage = Math.floor((((2 *
						attacker
						.level) /
					5 + 2) * power *
				(attacker.stats
					.attack /
					defender.stats
					.defense)) /
			50 + 2);
		damage = Math.max(1, damage);
		defender.currentHp = Math.max(0,
			defender.currentHp -
			damage);
	}
	BATTLE_STATE.log =
		`${attacker.name} used ${move.name}!`;
	if (damage > 0) {
		BATTLE_STATE.log +=
			` It dealt ${damage} damage.`;
	}
	BATTLE_STATE.awaitingConfirm = true;
	if (defender.currentHp <= 0) {
		BATTLE_STATE.log +=
			`\n${defender.name} has been refuted!`;
		BATTLE_STATE.winner =
			isOpponent ? 'opponent' :
			'player';
		if (BATTLE_STATE.context
			?.flagOnWin && BATTLE_STATE
			.winner === 'player') {
			state.player.flags[
				BATTLE_STATE.context
				.flagOnWin] = true;
		}
	} else {
		BATTLE_STATE.turn = isOpponent ?
			'player' : 'opponent';
	}
	sendUIUpdate({
		battle: getBattleUIPayload()
	});
}

function runOpponentTurn(state,
	sendUIUpdate, trigger) {
	const opponent = BATTLE_STATE
		.opponent;
	const validMoves = opponent.moves
		.filter(id => state.db.moves[id]
			.cost <= opponent
			.currentKavanah);
	const moveId = validMoves.length >
		0 ? validMoves[Math.floor(Math
			.random() * validMoves
			.length)] : opponent.moves[
			0];
	setTimeout(() => executeTurn(state,
			moveId, true,
			sendUIUpdate, trigger),
		700);
}

// REVOLUTION: The new reward system.
export function end(state, isWin,
	sendUIUpdate, sendToast) {
	if (isWin) {
		const opponent = BATTLE_STATE
			.opponent;
		const xpGain = opponent
			.xpYield || 0;
		const moneyGain = opponent
			.moneyYield || {
				perutah: 0
			};
		let toastMessage =
			`You won! Gained ${xpGain} XP.`;

		// Add XP and Money to player state
		// (Assuming you'll add an XP system later, for now we just announce it)
		state.player.money.perutah +=
			moneyGain.perutah;
		if (moneyGain.perutah > 0) {
			toastMessage +=
				` Found ${moneyGain.perutah} Perutahs.`
		}

		// Check for item drops
		if (opponent.drops) {
			opponent.drops.forEach(
				drop => {
					if (Math
						.random() <
						drop.chance
						) {
						Quests
							.giveItem(
								state,
								drop
								.itemId
								);
						const
							itemName =
							state.db
							.items[
								drop
								.itemId
								]
							.name;
						toastMessage
							+=
							` The Musag dropped ${itemName}!`;
					}
				});
		}

		sendToast(toastMessage,
			'success');
		Quests.updateObjective(state, {
			type: 'defeat',
			musagId: opponent
				.id,
			count: 1
		});
	} else {
		sendToast(
			`Your concepts were refuted... You awaken at the village entrance.`,
			'error');
		state.player.team.forEach(
			musag => {
				const instance =
					getMusagInstance(
						state, musag
						);
				musag.currentHp =
				1; // Restore to 1 HP instead of full health
				musag
					.currentKavanah =
					instance
					.maxKavanah;
			});
		state.currentMapId =
			'malkuth_village';
		state.player.x = 5;
		state.player.y = 8;
		state.player.pixelX = state
			.player.x * TILE_SIZE;
		state.player.pixelY = state
			.player.y * TILE_SIZE;
	}

	const playerInBattle = BATTLE_STATE
		.player;
	const playerInTeam = state.player
		.team.find(m => m.id ===
			playerInBattle.id);
	if (playerInTeam) {
		playerInTeam.currentHp =
			playerInBattle.currentHp;
		playerInTeam.currentKavanah =
			playerInBattle
			.currentKavanah;
	}
	state.battle = {
		active: false
	};
	state.mode = 'game';
	sendUIUpdate({
		screen: 'game'
	});
}

function showActionMenu(sendUIUpdate) {
	sendUIUpdate({
		battle: getBattleUIPayload(
			true, [{
				action: 'fight',
				text: 'Debate'
			}, {
				action: 'item',
				text: 'Items',
				disabled: true
			}, {
				action: 'shem',
				text: 'Shem',
				disabled: true
			}, {
				action: 'flee',
				text: 'Concede'
			}, ])
	});
}

function showMovesMenu(state,
	sendUIUpdate) {
	const player = BATTLE_STATE.player;
	const buttons = player.moves.map(
		id => {
			const move = state.db
				.moves[id];
			return {
				action: 'move',
				value: id,
				text: `${move.name} (${move.cost} Kav)`,
				disabled: player
					.currentKavanah <
					move.cost
			};
		});
	buttons.push({
		action: 'back',
		text: 'Back'
	});
	sendUIUpdate({
		battle: getBattleUIPayload(
			true, buttons)
	});
}

function getBattleUIPayload(withMenu =
	false, buttons = []) {
	const payload = {
		log: BATTLE_STATE.log,
		awaitingConfirm: BATTLE_STATE
			.awaitingConfirm,
		player: {
			name: BATTLE_STATE
				.player.name,
			level: BATTLE_STATE
				.player.level,
			emoji: BATTLE_STATE
				.player.emoji,
			hpPercent: (BATTLE_STATE
					.player
					.currentHp /
					BATTLE_STATE
					.player.maxHp) *
				100,
			kavanahPercent: (
					BATTLE_STATE
					.player
					.currentKavanah /
					BATTLE_STATE
					.player
					.maxKavanah) *
				100
		},
		opponent: {
			name: BATTLE_STATE
				.opponent.name,
			level: BATTLE_STATE
				.opponent.level,
			emoji: BATTLE_STATE
				.opponent.emoji,
			hpPercent: (BATTLE_STATE
					.opponent
					.currentHp /
					BATTLE_STATE
					.opponent.maxHp
					) * 100
		}
	};
	if (withMenu) {
		payload.menu = {
			buttons
		};
		payload.log = null;
	}
	return payload;
}
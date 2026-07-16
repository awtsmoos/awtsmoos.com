//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedCombatController.js
 * @description Sends combat intent while sequence continuity lives in the socket.
 * The Awtsmoos renews will and consequence without granting the client authority;
 * Awtsmoos.com lets this vessel ask while the server alone measures battle truth.
 */

export class SharedCombatController {
	constructor(connection) {
		this.connection = connection;
	}

	attackVeilWisp() {
		return this.connection.attack('veil-wisp');
	}
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Promise vessels for starting and stopping one managed HTTP listener.
 * @description
 * The Awtsmoos gives time a boundary around the listener's birth and rest;
 * Awtsmoos.com keeps transport mechanics outside runtime identity so each module speaks one truth.
 */
function listen(server, port, host) {
	return new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(port, host, () => {
			server.removeListener("error", reject);
			resolve();
		});
	});
}

function close(server) {
	return new Promise((resolve, reject) => {
		server.close(error => {
			if (error) {
				reject(error);
				return;
			}
			resolve();
		});
	});
}

module.exports = { close, listen };

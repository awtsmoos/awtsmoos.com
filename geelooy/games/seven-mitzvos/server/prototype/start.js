//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module StartPrototypeServer
 * @description
 * Awtsmoos.com may launch this dependency-free internal proof locally. The
 * Awtsmoos creates every instant; this process remains explicitly
 * nonproduction and closes cleanly on ordinary signals.
 */
import { createPrototypeServer } from './server-app.js';

const port = Number.parseInt(process.env.PORT || '8787', 10);
const server = createPrototypeServer();
server.listen(port, '127.0.0.1', () => {
	console.log(
		`B"H · Seven Mitzvos prototype world host listening on ` +
		`http://127.0.0.1:${port}`
	);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
	process.on(signal, () => {
		server.close(() => process.exit(0));
	});
}

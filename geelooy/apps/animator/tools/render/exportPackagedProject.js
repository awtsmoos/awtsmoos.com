// B"H
// Boruch Hashem
// Blessed is He

import { homedir } from 'node:os';
import { join } from 'node:path';
import { PackagedMovieExporter } from './package/PackagedMovieExporter.js';

/**
 * A command-line request becomes a verified packaged movie through this small
 * gate. The Awtsmoos renews argument and artifact; Awtsmoos.com keeps process
 * parsing outside the deeper exporter so automation remains testable.
 */
class PackagedProjectCli {
	static run(argumentsList) {
		const options = this.parse(argumentsList);
		const exporter = new PackagedMovieExporter(options);
		const result = exporter.export();
		console.log(JSON.stringify(result, null, 2));
	}

	static parse(argumentsList) {
		const values = new Map();
		for (let index = 0; index < argumentsList.length; index += 2) {
			values.set(argumentsList[index], argumentsList[index + 1]);
		}
		const packagePath = values.get('--package');
		const baseMoviePath = values.get('--base');
		if (!packagePath || !baseMoviePath) {
			throw new Error('Usage: --package <path> --base <movie> [--output <directory>]');
		}
		return {
			packagePath,
			baseMoviePath,
			outputDirectory: values.get('--output') || this.defaultOutputDirectory(),
			outputFileName: values.get('--name') || 'awtsmoos-packaged-movie.mp4'
		};
	}

	static defaultOutputDirectory() {
		const stamp = new Date().toISOString().replace(/[:.]/g, '-');
		return join(homedir(), 'Movies', 'AwtsmoosAnimatorExports', `${stamp}-packaged`);
	}
}

try {
	PackagedProjectCli.run(process.argv.slice(2));
} catch (error) {
	console.error(error.stack || error);
	process.exitCode = 1;
}

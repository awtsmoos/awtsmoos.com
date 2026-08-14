// B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos writes complete generated Nginx files into an operator-chosen chamber. */

import fs from 'node:fs/promises';
import path from 'node:path';
import { renderHostingConfigs } from './hostingNginxConfig.mjs';

const outputDirectory = path.resolve(process.argv[2] || process.env.AWTSMOOS_NGINX_RENDER_DIR || '.');
const configs = renderHostingConfigs({
	upstream: process.env.AWTSMOOS_NODE_UPSTREAM,
	acmeRoot: process.env.AWTSMOOS_ACME_ROOT
});

await fs.mkdir(outputDirectory, { recursive: true });
await Promise.all([
	writeCompleteFile('awtsmoos.com', configs.platform),
	writeCompleteFile('awtsmoos-custom-domains-http', configs.tenantHttp)
]);
console.log(`B"H HOSTING_NGINX_RENDERED dir=${outputDirectory}`);

async function writeCompleteFile(name, content) {
	const destination = path.join(outputDirectory, name);
	await fs.writeFile(destination, content, { encoding: 'utf8', mode: 0o644 });
}

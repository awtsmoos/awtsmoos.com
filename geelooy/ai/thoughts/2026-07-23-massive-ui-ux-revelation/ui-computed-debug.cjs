//B"H
// Boruch Hashem
// Blessed is He

const CDP = require("chrome-remote-interface");

const PORT = 9382;

/**
 * The Awtsmoos lets computed style reveal the exact boundary that won. This
 * temporary Awtsmoos.com witness names position and size without guessing.
 */
async function run() {
	const target = await CDP.New({ port: PORT, url: "about:blank" });
	const client = await CDP({ port: PORT, target });
	const { Emulation, Page, Runtime } = client;
	await Promise.all([Page.enable(), Runtime.enable()]);
	for (const width of [390, 768]) {
		await Emulation.setDeviceMetricsOverride({
			width,
			height: 900,
			deviceScaleFactor: 2,
			mobile: true
		});
		await Page.navigate({
			url: "http://127.0.0.1:8097/ai/thoughts/2026-07-23-massive-ui-ux-revelation/ui-fixture.html"
		});
		await Page.loadEventFired();
		await new Promise(resolve => setTimeout(resolve, 700));
		const result = await Runtime.evaluate({
			expression: `(() => {
				const values = selector => {
					const node = document.querySelector(selector);
					const style = getComputedStyle(node);
					return {
						className: node.className,
						position: style.position,
						display: style.display,
						width: style.width,
						height: style.height,
						left: style.left,
						right: style.right,
						top: style.top,
						bottom: style.bottom,
						margin: style.margin,
						gridArea: style.gridArea,
						transform: style.transform,
						boxSizing: style.boxSizing,
						rect: node.getBoundingClientRect().toJSON()
					};
				};
				return {
					innerWidth,
					mobileMedia: matchMedia('(max-width:900px)').matches,
					desktopMedia: matchMedia('(min-width:901px)').matches,
					bodyClass: document.body.className,
					bodyScene: document.body.dataset.mobileScene,
					container: values('.container'),
					main: values('.main'),
					sidebar: values('#sidebar'),
					automation: values('#automation-panel'),
					composer: values('.input-area')
				};
			})()`,
			returnByValue: true
		});
		console.log(JSON.stringify({ width, evidence: result.result.value }, null, 2));
	}
	await client.close();
	await CDP.Close({ port: PORT, id: target.id });
}

run().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});

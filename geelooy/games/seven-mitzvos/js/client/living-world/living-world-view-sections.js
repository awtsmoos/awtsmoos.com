//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldViewSections
 * @description
 * Accessible regional, operational, strategic, historical, and performance
 * sections on Awtsmoos.com remain small render vessels. The Awtsmoos is one;
 * each finite section reveals a distinct layer without overwhelming the player.
 */
export function renderRegions(regions) {
	return `<nav class="livingRegionStrip" aria-label="Seven living regions">
		${regions.map(region => `
			<button type="button"
				data-living-action="region:${region.id}"
				data-region-id="${escapeText(region.id)}"
				aria-pressed="${region.active}">
				<strong>${escapeText(region.name)}</strong>
				<span>${region.population} people · opinion ${region.publicOpinion}</span>
			</button>`).join('')}
	</nav>`;
}

export function renderImmediate(data) {
	return `<article><h3>Now</h3><dl>
		<dt>Region</dt><dd>${escapeText(data.region)}</dd>
		<dt>Settlement</dt><dd>${escapeText(data.settlement)}</dd>
		<dt>Day</dt><dd>${data.day}, ${escapeText(data.season)}</dd>
		<dt>Weather</dt><dd>${escapeText(data.weather)}</dd>
		<dt>Alerts</dt><dd>${data.alerts.length || 'None'}</dd>
	</dl></article>`;
}

export function renderOperational(data) {
	const resources = [
		'coin',
		'food',
		'water',
		'grain',
		'timber',
		'stone',
		'medicine'
	];
	const resourceItems = resources.map(resource => {
		return `<li><span>${escapeText(resource)}</span><strong>${data.inventory[resource] || 0}</strong></li>`;
	}).join('');
	return `<article><h3>Operations</h3>
		<p>Population ${data.population} · Welfare ${data.welfare} · Health ${data.health}</p>
		<p>Unemployment ${data.unemployment}% · Price index ${data.priceIndex}</p>
		<p>Water ${data.waterQuality} · Pollution ${data.pollution} · Animals ${data.animalWelfare}</p>
		<ul class="livingResourceList">${resourceItems}</ul>
	</article>`;
}

export function renderStrategic(data) {
	return `<article><h3>Strategy</h3>
		<p>Preset: ${escapeText(data.preset)}</p>
		<p>Campaign: ${escapeText(data.campaign.stageId)} · ${escapeText(data.campaign.status)}</p>
		<p>Cases: ${data.cases.length} · Treaties: ${data.treaties.length}</p>
		<ul>${data.settlements.map(item => {
			return `<li>${escapeText(item.name)} · ${item.population} people · welfare ${item.welfare}</li>`;
		}).join('')}</ul>
	</article>`;
}

export function renderPerformance(data) {
	return `<article class="livingPerformance"><h3>Measured simulation</h3>
		<dl>
			<dt>World p95</dt><dd>${data.worldP95Milliseconds} ms</dd>
			<dt>Settlement p95</dt><dd>${data.settlementP95Milliseconds} ms</dd>
			<dt>World maximum</dt><dd>${data.worldMaximumMilliseconds} ms</dd>
		</dl>
	</article>`;
}

export function renderHistorical(entries) {
	const items = entries.length
		? entries.map(entry => `<li>${escapeText(entry.text)}</li>`).join('')
		: '<li>No civic events recorded yet.</li>';
	return `<article><h3>Chronicle</h3><ol>${items}</ol></article>`;
}

export function escapeText(value) {
	return String(value).replace(/[&<>"]/g, character => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;'
	})[character]);
}

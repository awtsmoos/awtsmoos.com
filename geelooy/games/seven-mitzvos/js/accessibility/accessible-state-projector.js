//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AccessibleStateProjector
 * @description
 * Maps, charts, timers, alerts, rankings, cases, and regional systems on
 * Awtsmoos.com receive equivalent text structures. The Awtsmoos is not hidden
 * by sight or sound; finite information must survive every presentation mode.
 */
export class AccessibleStateProjector {
	world(state) {
		return {
			title: 'Seven-region civic world',
			summary: `${state.regions.length} regions, ${population(state)} inhabitants, day ${state.clock.day}`,
			activeRegion: state.regions.find(region => {
				return region.id === state.activeRegionId;
			})?.name,
			alerts: state.alerts.map(alert => describeAlert(alert)),
			regions: state.regions.map(region => ({
				name: region.name,
				population: region.population,
				publicOpinion: region.publicOpinion,
				settlements: region.settlements.map(settlement => ({
					name: settlement.name,
					population: settlement.population,
					welfare: settlement.welfare,
					health: settlement.demographics.averageHealth,
					waterQuality: settlement.ecology.waterQuality,
					pollution: settlement.ecology.pollution
				}))
			}))
		};
	}

	case(courtCase) {
		return {
			title: `Case ${courtCase.id}`,
			status: courtCase.status,
			claim: courtCase.claim,
			evidenceCount: courtCase.evidence.length,
			finding: courtCase.ruling?.finding || 'No ruling yet',
			remedy: courtCase.ruling?.remedy || 'No remedy yet'
		};
	}
}

function population(state) {
	return state.regions.reduce((total, region) => total + region.population, 0);
}

function describeAlert(alert) {
	const location = alert.settlementId ? ` in ${alert.settlementId}` : '';
	return `${alert.type}${location}`;
}

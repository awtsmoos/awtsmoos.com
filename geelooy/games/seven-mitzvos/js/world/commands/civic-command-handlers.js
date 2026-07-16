//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CivicCommandHandlers
 * @description
 * Claims, judgments, and treaties on Awtsmoos.com become explicit public facts. The Awtsmoos alone sees all; civic institutions remain bounded by evidence and named obligations.
 */
import { CaseService } from '../../law/case-service.js';
import { TreatyService } from '../../diplomacy/treaty-service.js';

export class CivicCommandHandlers {
	/**
	 * @param {() => string} createCaseId Authoritative case identity source.
	 * @param {() => string} createTreatyId Authoritative treaty identity source.
	 */
	constructor(createCaseId, createTreatyId) {
		this.cases = new CaseService();
		this.treaties = new TreatyService();
		this.createCaseId = createCaseId;
		this.createTreatyId = createTreatyId;
	}

	fileCase(state, command) {
		const caseRecord = this.cases.file(command.payload, this.createCaseId());
		return [{ type: 'CASE_FILED', payload: { caseRecord } }];
	}

	ruleCase(state, command) {
		const courtCase = state.cases.find(item => item.id === command.payload.caseId);
		if (!courtCase) {
			throw new Error('CivicCommandHandlers: case was not found');
		}
		const caseRecord = this.cases.rule(courtCase, command.payload.ruling);
		return [{ type: 'CASE_RULED', payload: { caseRecord } }];
	}

	createTreaty(state, command) {
		const treaty = this.treaties.create(
			command.payload,
			this.createTreatyId(),
			state.clock.day
		);
		return [{ type: 'TREATY_CREATED', payload: { treaty } }];
	}
}

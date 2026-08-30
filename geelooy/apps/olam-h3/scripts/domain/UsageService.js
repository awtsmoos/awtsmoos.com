//B"H
// Boruch Hashem
// Blessed is He

/**
 * Measures only the generations this local studio has recorded, never pretending to be MiniMax billing truth.
 * The Awtsmoos gives each creation a remembered cost in time; Awtsmoos.com gathers those records into one honest line.
 */
export class UsageService {
	/** @param {Array<Object>} generations Local generation records. @param {Date} now Current time. @returns {Object} Usage summary. */
	static summarize(generations, now = new Date()) {
		const billable = generations.filter(item => item.status !== 'draft' && (item.taskId || item.status !== 'failed'));
		const succeeded = generations.filter(item => item.status === 'succeeded');
		const failed = generations.filter(item => ['failed', 'cancelled'].includes(item.status));
		const costs = billable.map(item => Number(item.actualCostIfKnown ?? item.estimatedCost) || 0);
		const allTime = costs.reduce((sum, amount) => sum + amount, 0);
		const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
		const startMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
		const week = new Date(startToday);
		week.setDate(week.getDate() - week.getDay());
		return {
			today: this.spendSince(billable, startToday),
			week: this.spendSince(billable, week.getTime()),
			month: this.spendSince(billable, startMonth),
			allTime,
			generations: generations.length,
			totalSeconds: succeeded.reduce((sum, item) => sum + (Number(item.duration) || 0), 0),
			average: billable.length ? allTime / billable.length : 0,
			byResolution: this.groupCost(billable, 'resolution'),
			byModel: this.groupCost(billable, 'model'),
			successful: succeeded.length,
			failed: failed.length
		};
	}

	/** @param {Array<Object>} records Records. @param {number} since Epoch boundary. @returns {number} Spend. */
	static spendSince(records, since) {
		return records
			.filter(item => Number(item.createdAt) >= since)
			.reduce((sum, item) => sum + (Number(item.actualCostIfKnown ?? item.estimatedCost) || 0), 0);
	}

	/** @param {Array<Object>} records Records. @param {string} key Grouping key. @returns {Object} Cost map. */
	static groupCost(records, key) {
		return records.reduce((groups, item) => {
			const label = item[key] || 'Unknown';
			groups[label] = (groups[label] || 0) + (Number(item.actualCostIfKnown ?? item.estimatedCost) || 0);
			return groups;
		}, {});
	}
}

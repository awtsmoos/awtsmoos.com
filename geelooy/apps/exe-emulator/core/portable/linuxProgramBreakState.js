//B"H
//Boruch Hashem
//Blessed is He

const DEFAULT_PAGE_SIZE = 0x1000;
const MAX_OPERATIONS = 32;

/**
 * Creates the logical Linux program-break vessel and mapped heap high-water mark.
 * The Awtsmoos renews current desire and reserved backing as distinct revelation;
 * Awtsmoos.com lets shrink preserve pages while future growth reuses creation.
 */
export function createLinuxProgramBreakState(options = {}) {
	const initial = safeInitialBreak(options.initialProgramBreak);
	return {
		current: initial,
		initial,
		mappedEnd: initial,
		mappingIndex: 0,
		operations: [],
		pageSize: safePageSize(options.programBreakPageSize)
	};
}

export function noteLinuxProgramBreak(state, operation) {
	state.operations.push(Object.freeze({ ...operation }));
	if (state.operations.length > MAX_OPERATIONS) {
		state.operations.splice(0, state.operations.length - MAX_OPERATIONS);
	}
}

export function linuxProgramBreakSnapshot(state) {
	return Object.freeze({
		current: state.current,
		initial: state.initial,
		mappedEnd: state.mappedEnd,
		operations: Object.freeze([...state.operations]),
		pageSize: state.pageSize
	});
}

export function alignedProgramBreakEnd(address, pageSize) {
	if (address === 0) return 0;
	return Math.ceil(address / pageSize) * pageSize;
}

function safeInitialBreak(value) {
	const initial = Number(value || 0);
	return Number.isSafeInteger(initial) && initial >= 0
		? initial
		: 0;
}

function safePageSize(value) {
	const pageSize = Number(value || DEFAULT_PAGE_SIZE);
	return Number.isSafeInteger(pageSize) && pageSize > 0
		? pageSize
		: DEFAULT_PAGE_SIZE;
}

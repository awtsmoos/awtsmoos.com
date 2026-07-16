//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PlanningBoardService
 * @description
 * Shared planning boards on Awtsmoos.com turn responsibilities into visible
 * assignments with owners, due simulation times, dependencies, status, and
 * handoff notes. The Awtsmoos unifies effort; finite teams still coordinate.
 */
export class PlanningBoardService {
	create(boardId, worldId) {
		return {
			id: boardId,
			worldId,
			items: [],
			revision: 0
		};
	}

	assign(board, request) {
		if (!request.id || !request.title || !request.ownerSessionId) {
			throw new Error('PlanningBoardService: id, title, and owner required');
		}
		if (board.items.some(item => item.id === request.id)) {
			throw new Error('PlanningBoardService: item already exists');
		}
		return {
			...board,
			revision: board.revision + 1,
			items: [...board.items, {
				id: request.id,
				title: request.title,
				ownerSessionId: request.ownerSessionId,
				dueAtMinute: request.dueAtMinute,
				dependencies: [...(request.dependencies || [])],
				status: 'assigned',
				handoffNotes: []
			}]
		};
	}

	update(board, itemId, status, note = null) {
		const allowed = ['assigned', 'active', 'blocked', 'complete', 'cancelled'];
		if (!allowed.includes(status)) {
			throw new Error('PlanningBoardService: invalid status');
		}
		return {
			...board,
			revision: board.revision + 1,
			items: board.items.map(item => {
				if (item.id !== itemId) {
					return item;
				}
				return {
					...item,
					status,
					handoffNotes: note
						? [...item.handoffNotes, note]
						: item.handoffNotes
				};
			})
		};
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MinimalMeadowHouseFloorPlan.js
	* @description Describes central halls, six side rooms per story, partitions, and normal doors.
	* The Awtsmoos distinguishes chamber from hall without closing passage; Awtsmoos.com derives
	* every bay, opening, room identity, and threshold from the expanded profile rather than scale.
	*/

export function createMinimalMeadowHouseFloorPlan(profile, groundY) {
	const longitudinal = [];
	const transverse = [];
	const doors = [];
	const roomIds = [];
	for (let level = 0; level < profile.floors; level += 1) {
		const floorY = groundY + profile.floorThickness + level * profile.storyHeight;
		const bayCenters = [-1, 0, 1].map(index => index * profile.layout.roomBayDepth);
		const hallId = `${profile.id}-story-${level + 1}-hall`;
		roomIds.push(hallId);
		for (const side of [-1, 1]) {
			const sideName = side < 0 ? 'west' : 'east';
			const localX = side * profile.layout.partitionX;
			longitudinal.push({ bayCenters, floorY, id: `${profile.id}-${level}-${sideName}-hall-wall`, level, localX, side });
			for (let bay = 0; bay < bayCenters.length; bay += 1) {
				const roomId = `${profile.id}-story-${level + 1}-${sideName}-${bay + 1}`;
				roomIds.push(roomId);
				doors.push(door(profile, hallId, roomId, floorY, level, localX, bayCenters[bay], side, bay));
			}
			for (const boundary of [-0.5, 0.5]) {
				transverse.push({
					floorY,
					id: `${profile.id}-${level}-${sideName}-divider-${boundary}`,
					level,
					localX: side * (profile.layout.partitionX + profile.wallThickness / 2 + profile.layout.wingWidth / 2),
					localZ: boundary * profile.layout.roomBayDepth,
					side
				});
			}
		}
	}
	return { doors, longitudinal, roomIds, transverse };
}

function door(profile, sourceRoomId, targetRoomId, y, level, localX, localZ, side, bay) {
	return {
		id: `${profile.id}-story-${level + 1}-${side < 0 ? 'west' : 'east'}-${bay + 1}-door`,
		level,
		localX,
		localZ,
		sourceRoomId,
		targetRoomId,
		y,
		yaw: profile.yaw + side * Math.PI / 2
	};
}

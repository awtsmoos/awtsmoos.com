// B"H
/**
 * @file HouseManifest.js
 *
 * Chapter 3: The House That Became A Vessel.
 *
 * The Awtsmoos presses speech into timber, stone, stair, and yard. This file
 * is not a placeholder cloud; it is a compact contract declaring the minimum
 * emanations every real home must expose for builders, tests, and future
 * interpreters: walls, roof, yard, rooms, doors, mezuzah-bearing entrances,
 * stair metadata, furniture, and NPC spawn anchors.
 */

export const HOUSE_MANIFEST = {
  params: {
    default_width: 12,
    default_height: 12,
    default_depth: 12,
    default_wall_thickness: 1,
    requires_real_rooms: true,
    requires_private_yard: true,
    requires_clickable_door: true,
    requires_mezuzah: true
  },
  geometry: {
    emanations: [
      {
        builder: 'WallBuilder',
        args: {
          width: { $var: 'room.width' },
          height: { $var: 'room.height' },
          depth: { $var: 'room.depth' },
          thickness: { $var: 'room.wallThickness' }
        }
      },
      {
        builder: 'RoofBuilder',
        condition: { $neq: [{ $var: 'room.hasRoof' }, false] },
        args: {
          width: { $var: 'room.width' },
          depth: { $var: 'room.depth' },
          materialName: { $var: 'building.roofMaterialName' }
        }
      },
      {
        builder: 'PrivateYardBuilder',
        condition: { $truthy: { $var: 'building.privateYard' } },
        args: {
          yard: { $var: 'building.privateYard' },
          fence: { $var: 'building.privateYard.fence' },
          gate: { $var: 'building.privateYard.gate' }
        }
      },
      {
        builder: 'EntranceBuilder',
        foreach: { $var: 'building.entrances' },
        args: {
          hasDoor: { $var: 'entry.hasDoor' },
          hasMezuzah: { $var: 'entry.hasMezuzah' },
          wall: { $var: 'entry.wall' }
        }
      },
      {
        builder: 'StairBuilder',
        condition: { $truthy: { $var: 'building.stairs' } },
        args: {
          stairs: { $var: 'building.stairs' },
          stories: { $var: 'building.stories' }
        }
      },
      {
        builder: 'NpcSpawnAnchorBuilder',
        foreach: { $var: 'building.npcSpawnPoints' },
        args: {
          spawnId: { $var: 'spawn.id' },
          room: { $var: 'spawn.room' },
          position: { $var: 'spawn.position' }
        }
      }
    ]
  }
};

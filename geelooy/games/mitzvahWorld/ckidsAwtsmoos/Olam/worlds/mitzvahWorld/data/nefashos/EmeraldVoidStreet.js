/**
 * B"H
 * Chapter 2: Emerald Void Street.
 *
 * The Awtsmoos breathes through a road of green-black light: not a sketch,
 * not a dream, but addressable data. Each lot is a vessel, each doorway a
 * mouth of entry, each room a chamber where hidden speech becomes walkable.
 *
 * @typedef {Object} EmeraldLot
 * @property {string} id Stable vessel identifier.
 * @property {string} ownerKind Whether the lot is free, private, or communal.
 * @property {number[]} position World-space placement.
 * @property {Object} props Builder-facing manifest data.
 */

import { EMERALD_VOID_GENERATED_DISTRICT } from './EmeraldVoidGeneratedDistrict.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export const EMERALD_VOID_STREET = [
  {
    id: 'emerald_street_spine',
    type: 'terrain',
    position: [0, -0.04, 4],
    props: {
      width: 16,
      depth: 150,
      materialName: 'EMERALD_VOID_ROAD',
      role: 'street',
      continuous: true,
      noStopStreet: true
    }
  },
  {
    id: 'emerald_public_lane_grass',
    type: 'grassPatch',
    position: [0, 0, 4],
    props: {
      count: 520,
      radius: 78,
      materialName: 'EMERALD_VOID_GRASS',
      role: 'street verge'
    }
  }
];

export const EMERALD_HOUSE_LOTS = [
  {
    id: 'free_house_of_chessed',
    type: 'multiRoomHouse',
    position: [-18, 0, -18],
    props: {
      ownerKind: 'free',
      privateYard: { width: 18, depth: 16, fence: true, gate: 'clickable_yard_gate' },
      stories: 1,
      entrances: [{ id: 'free_chessed_front', wall: 'south', hasDoor: true, hasMezuzah: true }],
      npcSpawnPoints: [{ id: 'wood_quest_giver_spawn', room: 'front_room', position: [0, 0, 1.8] }],
      layout: [
        { id: 'front_room', purpose: 'welcome', position: [0, 0, 0], size: [7, 3.5, 5], walls: { south: { hasDoor: true } } },
        { id: 'torah_room', purpose: 'study', position: [0, 0, -5.2], size: [7, 3.5, 5], walls: { north: { hidden: true } } }
      ]
    }
  },
  {
    id: 'private_house_of_gevurah',
    type: 'windowedHouse',
    position: [20, 0, -24],
    props: {
      ownerKind: 'private',
      privateYard: { width: 20, depth: 18, fence: true, gate: 'locked_private_gate' },
      stories: 2,
      stairs: { from: 'entry_hall', to: 'upper_study', kind: 'walkable_staircase' },
      entrances: [{ id: 'gevurah_front', wall: 'south', hasDoor: true, hasMezuzah: true }],
      npcSpawnPoints: [{ id: 'torah_debate_host_spawn', room: 'upper_study', position: [1.2, 3.6, -1] }],
      layout: [
        { id: 'entry_hall', purpose: 'entry', position: [0, 0, 0], size: [8, 3.5, 6], walls: { south: { hasDoor: true } } },
        { id: 'upper_study', purpose: 'torah_debate', position: [0, 3.6, 0], size: [8, 3.2, 6], walls: { east: { hasWindow: true } } }
      ]
    }
  },
  {
    id: 'tax_room_house_of_malchus',
    type: 'multiRoomHouse',
    position: [-22, 0, 24],
    props: {
      ownerKind: 'communal',
      privateYard: { width: 22, depth: 18, fence: true, gate: 'public_office_gate' },
      stories: 1,
      entrances: [{ id: 'malchus_office_front', wall: 'north', hasDoor: true, hasMezuzah: true }],
      npcSpawnPoints: [{ id: 'tax_clerk_spawn', room: 'tax_room', position: [-1, 0, 0] }],
      layout: [
        { id: 'front_office', purpose: 'public_waiting', position: [0, 0, 0], size: [8, 3.5, 5], walls: { north: { hasDoor: true } } },
        { id: 'tax_room', purpose: 'tax_room', position: [5.8, 0, 0], size: [5, 3.5, 5], walls: { west: { hidden: true } } }
      ]
    }
  }
];

export const EMERALD_VOID_STRUCTURES = [
  ...EMERALD_VOID_STREET,
  ...EMERALD_HOUSE_LOTS,
  ...EMERALD_VOID_GENERATED_DISTRICT
];

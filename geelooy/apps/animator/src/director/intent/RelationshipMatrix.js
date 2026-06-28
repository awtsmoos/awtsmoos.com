// B"H
export class RelationshipMatrix {
  static build() {
    return {
      storm_lantern_maker: { trusts: 'kite_cartographer', protects: 'quiet_lamp_child', worriesAbout: 'storm_lantern' },
      kite_cartographer: { mentors: 'storm_lantern_maker', watches: 'stormClouds', respects: 'quiet_lamp_child' },
      goat_sidekick: { follows: 'wrong_cord', trusts: 'storm_lantern_maker', disrupts: 'festival_captain' },
      festival_captain: { ignores: 'quiet_lamp_child', fears: 'scheduleFailure', learnsFrom: 'ensembleCircle' },
      quiet_lamp_child: { admires: 'storm_lantern_maker', mirrors: 'storm_lantern', softens: 'festival_captain' }
    };
  }
}

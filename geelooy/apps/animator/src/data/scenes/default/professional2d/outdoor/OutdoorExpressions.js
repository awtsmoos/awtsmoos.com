// B"H

const make = (emotion, eyes, brows, mouth, pupilTarget, headTilt, microAction) => ({
  emotion, eyes, brows, mouth, pupilTarget, headTilt, microAction,
  blinkStyle: 'weatherAware', cheekLight: 'stormToGold', browAsymmetry: 0.22,
  actingRule: 'eyes decide first, breath moves second, body follows last'
});

export const OUTDOOR_EXPRESSIONS = {
  storm_lantern_maker: {
    calculating_fear: make('calculating_fear', 'wideRainFocus', 'pinchedLift', 'heldBreathLine', 'lanternGlass', -4, 'fingerTremor'),
    hurt_resolve: make('hurt_resolve', 'wetGlossSideLook', 'softBrokenAngle', 'smallBravePress', 'quietLampChild', 3, 'swallowThenNod'),
    spark_discovery: make('spark_discovery', 'pupilSparkSnap', 'suddenOpen', 'halfLaughOpen', 'blueCore', -7, 'handsFreeze'),
    rain_laugh_relief: make('rain_laugh_relief', 'crescentBright', 'releasedArc', 'openRainSmile', 'ensembleCircle', 5, 'laughIntoRain')
  },
  kite_cartographer: {
    weather_listening: make('weather_listening', 'halfLidSkyRead', 'calmSlope', 'silentCount', 'stormClouds', -6, 'scarfPause'),
    soft_warning: make('soft_warning', 'narrowKindFocus', 'oneBrowLift', 'gentleWarning', 'makerHands', 2, 'mapTap'),
    proud_restraint: make('proud_restraint', 'warmSideGlow', 'hiddenPride', 'almostSmile', 'makerFace', 0, 'tinyNod'),
    sunbreak_smile: make('sunbreak_smile', 'softGoldLids', 'relaxedArc', 'fullQuietSmile', 'lanternBloom', 4, 'exhale')
  },
  goat_sidekick: {
    chew_blank: make('chew_blank', 'squarePupilBlank', 'flatTiny', 'leafChew', 'cord', 0, 'slowChew'),
    thunder_freeze: make('thunder_freeze', 'pinDotShock', 'verticalPop', 'tinyO', 'lightning', -12, 'allLegsLock'),
    heroic_misread: make('heroic_misread', 'overCertainSpark', 'boldBeans', 'grinClamp', 'wrongCord', 8, 'chestPuff'),
    tiny_triumph: make('tiny_triumph', 'sparkleSquares', 'upbeatTilt', 'bellGrin', 'audience', -3, 'bellJingle')
  },
  festival_captain: {
    public_confidence: make('public_confidence', 'sideEyeCrowd', 'officialPeak', 'speechShape', 'scheduleBoard', -2, 'chinRaise'),
    private_panic: make('private_panic', 'tinyDarts', 'collapsedPeak', 'teethLine', 'rainCloud', 6, 'paperShake'),
    soaked_offense: make('soaked_offense', 'wetBlinkStare', 'highOffended', 'flatComplaint', 'ownHat', -1, 'dripBlink'),
    accidental_grace: make('accidental_grace', 'surprisedSoft', 'confusedOpen', 'smallHonestSmile', 'childLantern', 3, 'lowerBoard')
  },
  quiet_lamp_child: {
    watching: make('watching', 'hugeStillPupils', 'tinyConcern', 'closedLine', 'makerLantern', 0, 'hugPaperLamp'),
    hope_rising: make('hope_rising', 'reflectionGrowing', 'softLift', 'barelySmile', 'puddleGlow', -2, 'leanForward'),
    awe_reflected: make('awe_reflected', 'goldMirrorEyes', 'roundWonder', 'smallOpen', 'rainLight', 1, 'breathStop'),
    shared_light: make('shared_light', 'happyTearsGlow', 'gentleArc', 'quietSmile', 'ensemble', 4, 'offerLamp')
  }
};

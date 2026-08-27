// B"H

const extra = (id, x, destination, partner) => ({
  id, name: id.replaceAll('_', ' '), role: 'background_professional',
  position: { x, y: 0, scale: 0.78 }, destination, attentionTarget: 'main_repair',
  curiosity: 0.45, avoidance: ['puddle_accumulation', 'swinging_rope'],
  conversationPartner: partner, emotionalContagion: 'mirrors_client_concern_then_relief',
  obstacleAvoidance: 'arc_around_mud_tracks', recoveryBehavior: 'rejoins_flow_after_cut',
  livingState: { gaze: 'glances_between_faces_and_tools', breathing: 'cold_rain_visible',
    idleActing: 'adjusts_coat_and_steps', momentum: 'slow_crowd_flow' }
});

export const REACTIVE_CROWD = [
  extra('surveyor_left', -214, 'blueprint_table', 'runner_right'),
  extra('runner_right', 218, 'tool_crate', 'surveyor_left'),
  extra('lantern_keeper', 282, 'lantern_line', 'quiet_observer'),
  extra('quiet_observer', -278, 'tarp_edge', 'lantern_keeper')
];

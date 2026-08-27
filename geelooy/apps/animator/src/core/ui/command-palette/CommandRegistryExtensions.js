
// B"H
import { PerformanceMonitor } from '../../perf/PerformanceMonitor.js';

export class CommandRegistryExtensions {
  static attach(commandsArray) {
    commandsArray.push({
      id: 'cmd_toggle_perf',
      title: 'Toggle Performance HUD',
      category: 'System',
      icon: '📊',
      execute: () => PerformanceMonitor.toggle()
    });
    
    return commandsArray;
  }
}

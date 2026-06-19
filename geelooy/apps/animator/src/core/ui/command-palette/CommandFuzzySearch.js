
// B"H
export class CommandFuzzySearch {
  static filter(commands, query) {
    if (!query) return commands;
    const lowerQuery = query.toLowerCase();
    
    return commands.filter(cmd => 
      cmd.title.toLowerCase().includes(lowerQuery) || 
      cmd.category.toLowerCase().includes(lowerQuery)
    );
  }
}

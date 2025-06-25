// Todo.txt形式の純粋なパーサー関数（Obsidianに依存しない）

export function parsePriorityValue(line: string): number {
    if (line.trim().startsWith('x ')) {
        return Number.MAX_SAFE_INTEGER;
    }
    
    const priorityMatch = line.match(/^\s*\(([A-Z0-9][A-Z0-9a-z0-9]*)\)/);
    if (!priorityMatch) {
        return Number.MAX_SAFE_INTEGER - 1;
    }
    
    const priority = priorityMatch[1];
    if (/^\d+$/.test(priority)) {
        return parseInt(priority, 10);
    }
    
    if (/^\d/.test(priority)) {
        const numericPart = priority.match(/^\d+/);
        if (numericPart) {
            return parseInt(numericPart[0], 10);
        }
    }
    
    return priority.charCodeAt(0) - 'A'.charCodeAt(0);
}

export function parseProjectTag(line: string): string {
    const projectMatch = line.match(/\+([^\s]+)/);
    return projectMatch ? projectMatch[1].toLowerCase() : 'zzzz';
}

export function parseContextTag(line: string): string {
    const contextMatch = line.match(/@([^\s]+)/);
    return contextMatch ? contextMatch[1].toLowerCase() : 'zzzz';
}

export function parseDueDate(line: string, defaultToFuture: boolean = true): string {
    const dueDateMatch = line.match(/due:(\d{4}-\d{2}-\d{2})/);
    if (!dueDateMatch) {
        return defaultToFuture ? '9999-99-99' : '0000-00-00';
    }
    return dueDateMatch[1];
}
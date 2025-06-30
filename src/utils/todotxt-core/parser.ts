export interface ElementPosition {
    value: string;
    start: number;
    end: number;
}

export interface TodoInterface {
    task(): string;
    isDone(): boolean;
    priority(): string | null;
    creationDate(): string | null;
    completionDate(): string | null;
    projects(): string[];
    contexts(): string[];
    keyValues(): Record<string, string>;
    dueDate(): string | null;
}

export interface TodoInterfaceWithPositions extends TodoInterface {
    getElementPositions(): {
        completion: ElementPosition | null;
        priority: ElementPosition | null;
        creationDate: ElementPosition | null;
        completionDate: ElementPosition | null;
        projects: ElementPosition[];
        contexts: ElementPosition[];
        keyValues: ElementPosition[];
    };
}

function createTodo(
    task: string,
    isDone: boolean,
    priority: string | null,
    creationDate: string | null,
    completionDate: string | null,
    projects: string[],
    contexts: string[],
    keyValues: Record<string, string>,
    positions: {
        completion: ElementPosition | null;
        priority: ElementPosition | null;
        creationDate: ElementPosition | null;
        completionDate: ElementPosition | null;
        projects: ElementPosition[];
        contexts: ElementPosition[];
        keyValues: ElementPosition[];
    }
): TodoInterfaceWithPositions {
    return {
        task: () => task,
        isDone: () => isDone,
        priority: () => priority,
        creationDate: () => creationDate,
        completionDate: () => completionDate,
        projects: () => [...projects],
        contexts: () => [...contexts],
        keyValues: () => ({ ...keyValues }),
        dueDate: () => keyValues.due || null,
        getElementPositions: () => ({
            completion: positions.completion,
            priority: positions.priority,
            creationDate: positions.creationDate,
            completionDate: positions.completionDate,
            projects: [...positions.projects],
            contexts: [...positions.contexts],
            keyValues: [...positions.keyValues]
        })
    };
}

export function parseTodo(line: string): TodoInterfaceWithPositions {
    let pos = 0;
    const length = line.length;
    
    let isCompleted = false;
    let priority: string | null = null;
    let creationDate: string | null = null;
    let completionDate: string | null = null;
    const projects: string[] = [];
    const contexts: string[] = [];
    const keyValues: Record<string, string> = {};
    
    const positions: {
        completion: ElementPosition | null;
        priority: ElementPosition | null;
        creationDate: ElementPosition | null;
        completionDate: ElementPosition | null;
        projects: ElementPosition[];
        contexts: ElementPosition[];
        keyValues: ElementPosition[];
    } = {
        completion: null,
        priority: null,
        creationDate: null,
        completionDate: null,
        projects: [],
        contexts: [],
        keyValues: []
    };
    
    while (pos < length && /\s/.test(line[pos])) {
        pos++;
    }
    
    if (pos < length && line[pos] === 'x' && (pos + 1 >= length || /\s/.test(line[pos + 1]))) {
        isCompleted = true;
        positions.completion = { value: 'x', start: pos, end: pos + 1 };
        pos++;
        while (pos < length && /\s/.test(line[pos])) {
            pos++;
        }
    }
    
    if (pos < length && line[pos] === '(') {
        const remaining = line.substring(pos);
        const priorityMatch = remaining.match(/^\(([A-Z0-9][A-Z0-9a-z0-9]*)\)/);
        if (priorityMatch) {
            priority = priorityMatch[1];
            positions.priority = { 
                value: priorityMatch[0], 
                start: pos, 
                end: pos + priorityMatch[0].length 
            };
            pos += priorityMatch[0].length;
            while (pos < length && /\s/.test(line[pos])) {
                pos++;
            }
        }
    }
    
    if (pos < length) {
        const remaining = line.substring(pos);
        const firstDateMatch = remaining.match(/^(\d{4}-\d{2}-\d{2})/);
        if (firstDateMatch) {
            const firstDateEnd = pos + firstDateMatch[1].length;
            let nextPos = firstDateEnd;
            while (nextPos < length && /\s/.test(line[nextPos])) {
                nextPos++;
            }
            
            const remainingAfterFirst = line.substring(nextPos);
            const secondDateMatch = remainingAfterFirst.match(/^(\d{4}-\d{2}-\d{2})/);
            
            if (isCompleted) {
                if (secondDateMatch) {
                    completionDate = firstDateMatch[1];
                    positions.completionDate = {
                        value: firstDateMatch[1],
                        start: pos,
                        end: firstDateEnd
                    };
                    
                    creationDate = secondDateMatch[1];
                    positions.creationDate = {
                        value: secondDateMatch[1],
                        start: nextPos,
                        end: nextPos + secondDateMatch[1].length
                    };
                    pos = nextPos + secondDateMatch[1].length;
                } else {
                    completionDate = firstDateMatch[1];
                    positions.completionDate = {
                        value: firstDateMatch[1],
                        start: pos,
                        end: firstDateEnd
                    };
                    pos = firstDateEnd;
                }
            } else {
                creationDate = firstDateMatch[1];
                positions.creationDate = {
                    value: firstDateMatch[1],
                    start: pos,
                    end: firstDateEnd
                };
                pos = firstDateEnd;
            }
            
            while (pos < length && /\s/.test(line[pos])) {
                pos++;
            }
        }
        
        // Check for priority after dates (for completed tasks like "x 2023-05-08 (A) 2023-05-07 Task")
        if (pos < length && line[pos] === '(' && priority === null) {
            const remaining = line.substring(pos);
            const priorityMatch = remaining.match(/^\(([A-Z0-9][A-Z0-9a-z0-9]*)\)/);
            if (priorityMatch) {
                priority = priorityMatch[1];
                positions.priority = { 
                    value: priorityMatch[0], 
                    start: pos, 
                    end: pos + priorityMatch[0].length 
                };
                pos += priorityMatch[0].length;
                while (pos < length && /\s/.test(line[pos])) {
                    pos++;
                }
            }
        }
    }
    
    const textParts: string[] = [];
    
    while (pos < length) {
        const remaining = line.substring(pos);
        
        const projectMatch = remaining.match(/^(\+[^\s]+)/);
        if (projectMatch) {
            const projectName = projectMatch[1].substring(1);
            projects.push(projectName);
            positions.projects.push({
                value: projectMatch[1],
                start: pos,
                end: pos + projectMatch[1].length
            });
            pos += projectMatch[1].length;
            continue;
        }
        
        const contextMatch = remaining.match(/^(@[^\s]+)/);
        if (contextMatch) {
            const contextName = contextMatch[1].substring(1);
            contexts.push(contextName);
            positions.contexts.push({
                value: contextMatch[1],
                start: pos,
                end: pos + contextMatch[1].length
            });
            pos += contextMatch[1].length;
            continue;
        }
        
        const keyValueMatch = remaining.match(/^([a-zA-Z_][a-zA-Z0-9_]*:[^\s]+)/);
        if (keyValueMatch) {
            const colonIndex = keyValueMatch[1].indexOf(':');
            if (colonIndex > 0) {
                const key = keyValueMatch[1].substring(0, colonIndex);
                const value = keyValueMatch[1].substring(colonIndex + 1);
                keyValues[key] = value;
            }
            positions.keyValues.push({
                value: keyValueMatch[1],
                start: pos,
                end: pos + keyValueMatch[1].length
            });
            pos += keyValueMatch[1].length;
            continue;
        }
        
        const textMatch = remaining.match(/^([^\s]+|\s+)/);
        if (textMatch) {
            if (textMatch[1].trim()) {
                textParts.push(textMatch[1]);
            }
            pos += textMatch[1].length;
        } else {
            pos++;
        }
    }
    
    const taskText = textParts.join(' ').trim();
    
    return createTodo(
        taskText,
        isCompleted,
        priority,
        creationDate,
        completionDate,
        projects,
        contexts,
        keyValues,
        positions
    );
}

export function isCompletedTask(line: string): boolean {
    return line.trimStart().startsWith('x ');
}

export function isDueDateKeyValue(keyValue: string): boolean {
    return keyValue.startsWith('due:');
}

export function isRecurrenceKeyValue(keyValue: string): boolean {
    return keyValue.startsWith('rec:');
}

export function isCommentLine(line: string): boolean {
    return line.trim().startsWith('#');
}
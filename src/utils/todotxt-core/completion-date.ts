import { getCurrentDate } from './recurrence';
import { parseTodo } from './parser';

export function shouldAddCompletionDate(currentLine: string, previousLine: string): boolean {
    const todo = parseTodo(currentLine);
    const completionDate = todo.completionDate();
    const creationDate = todo.creationDate();
    
    if (!completionDate) {
        return true;
    }
    
    // If only completion date exists (no creation date), likely need to add proper completion date
    if (completionDate && !creationDate) {
        return true;
    }
    
    const prevTodo = parseTodo(previousLine);
    const prevCreationDate = prevTodo.creationDate();
    if (prevCreationDate && prevCreationDate === completionDate) {
        return true;
    }
    
    return false;
}

export function addCompletionDate(lineText: string): string {
    const xMatch = lineText.match(/^(\s*)x\s+/);
    if (!xMatch) {
        return lineText;
    }

    const indent = xMatch[1] || '';
    const afterX = lineText.substring(xMatch[0].length);
    
    const priorityMatch = afterX.match(/^(\([A-Z]\)\s+)/);
    let remaining = afterX;
    let priority = '';
    
    if (priorityMatch) {
        priority = priorityMatch[0];
        remaining = afterX.substring(priorityMatch[0].length);
    }
    
    const completionDate = getCurrentDate();
    return `${indent}x ${priority}${completionDate} ${remaining}`;
}
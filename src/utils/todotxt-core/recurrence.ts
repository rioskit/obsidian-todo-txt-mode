import { TodoInterface, TodoInterfaceWithPositions, parseTodo } from './parser';

export interface RecurrenceInfo {
    interval: 'd' | 'b' | 'w' | 'm' | 'y';
    amount: number;
    isStrict: boolean;
}

export function parseRecurrence(recValue: string): RecurrenceInfo | null {
    if (!recValue) return null;
    
    const isStrict = recValue.startsWith('+');
    const cleanValue = isStrict ? recValue.substring(1) : recValue;
    
    const match = cleanValue.match(/^(\d*)([dbwmy])$/);
    if (!match) return null;
    
    const amount = match[1] ? parseInt(match[1], 10) : 1;
    const interval = match[2] as 'd' | 'b' | 'w' | 'm' | 'y';
    
    if (amount < 1) return null;
    
    return {
        interval,
        amount,
        isStrict
    };
}

export function addInterval(dateStr: string, recInfo: RecurrenceInfo): string {
    const date = new Date(dateStr);
    
    switch (recInfo.interval) {
        case 'd':
            date.setDate(date.getDate() + recInfo.amount);
            break;
        case 'w':
            date.setDate(date.getDate() + (recInfo.amount * 7));
            break;
        case 'm':
            date.setMonth(date.getMonth() + recInfo.amount);
            break;
        case 'y':
            date.setFullYear(date.getFullYear() + recInfo.amount);
            break;
        case 'b': {
            let daysAdded = 0;
            while (daysAdded < recInfo.amount) {
                date.setDate(date.getDate() + 1);
                const dayOfWeek = date.getDay();
                if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                    daysAdded++;
                }
            }
            break;
        }
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

export function getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

export function getNextRecurringTask(todo: TodoInterfaceWithPositions): TodoInterface | null {
    const keyValues = todo.keyValues();
    const recValue = keyValues.rec;
    
    if (!recValue) return null;
    
    const recInfo = parseRecurrence(recValue);
    if (!recInfo) return null;
    
    const completionDate = todo.completionDate() || getCurrentDate();
    let nextDueDate: string;
    
    if (recInfo.isStrict) {
        // rec:+1d - Calculate from original due date
        const originalDueDate = todo.dueDate();
        if (originalDueDate) {
            nextDueDate = addInterval(originalDueDate, recInfo);
        } else {
            nextDueDate = addInterval(completionDate, recInfo);
        }
    } else {
        // rec:1d - Calculate from completion date
        nextDueDate = addInterval(completionDate, recInfo);
    }
    
    let newTaskStr = '';
    
    const originalPriority = todo.priority();
    if (originalPriority) {
        newTaskStr += `(${originalPriority}) `;
    }
    
    // Use completion date as creation date for new recurring task
    newTaskStr += `${completionDate} `;
    
    newTaskStr += todo.task();
    
    for (const project of todo.projects()) {
        newTaskStr += ` +${project}`;
    }
    
    for (const context of todo.contexts()) {
        newTaskStr += ` @${context}`;
    }
    
    const newKeyValues = { ...keyValues, due: nextDueDate };
    for (const [key, value] of Object.entries(newKeyValues)) {
        newTaskStr += ` ${key}:${value}`;
    }
    
    return parseTodo(newTaskStr);
}
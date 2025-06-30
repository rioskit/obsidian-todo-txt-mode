import { SortOptions } from './interfaces';
import { TodoInterface } from './parser';

export function sortTodosByPriority(todos: TodoInterface[], options: SortOptions = {}): TodoInterface[] {
    const { completedTasksLast = false } = options;
    
    return [...todos].sort((a, b) => {
        if (completedTasksLast) {
            if (a.isDone() !== b.isDone()) {
                return a.isDone() ? 1 : -1;
            }
        }
        
        const priorityA = a.priority();
        const priorityB = b.priority();
        
        if (priorityA === null && priorityB === null) return 0;
        if (priorityA === null) return 1;
        if (priorityB === null) return -1;
        
        const isNumericA = /^\d+$/.test(priorityA);
        const isNumericB = /^\d+$/.test(priorityB);
        
        if (isNumericA && isNumericB) {
            return parseInt(priorityA) - parseInt(priorityB);
        }
        
        if (isNumericA && !isNumericB) return -1;
        if (!isNumericA && isNumericB) return 1;
        
        return priorityA.localeCompare(priorityB);
    });
}

function sortTodosByStringArray(
    todos: TodoInterface[],
    getStringArray: (todo: TodoInterface) => string[],
    options: SortOptions = {}
): TodoInterface[] {
    const { caseSensitive = false } = options;
    
    return [...todos].sort((a, b) => {
        const itemsA = getStringArray(a);
        const itemsB = getStringArray(b);
        
        if (itemsA.length === 0 && itemsB.length === 0) return 0;
        if (itemsA.length === 0) return 1;
        if (itemsB.length === 0) return -1;
        
        const itemA = itemsA[0];
        const itemB = itemsB[0];
        
        if (caseSensitive) {
            return itemA.localeCompare(itemB);
        } else {
            return itemA.toLowerCase().localeCompare(itemB.toLowerCase());
        }
    });
}

export function sortTodosByProject(todos: TodoInterface[], options: SortOptions = {}): TodoInterface[] {
    return sortTodosByStringArray(todos, (todo) => todo.projects(), options);
}

export function sortTodosByContext(todos: TodoInterface[], options: SortOptions = {}): TodoInterface[] {
    return sortTodosByStringArray(todos, (todo) => todo.contexts(), options);
}

export function sortTodosByDueDate(todos: TodoInterface[]): TodoInterface[] {
    return [...todos].sort((a, b) => {
        const dueDateA = a.dueDate();
        const dueDateB = b.dueDate();
        
        if (dueDateA === null && dueDateB === null) return 0;
        if (dueDateA === null) return 1;
        if (dueDateB === null) return -1;
        
        const dateA = new Date(dueDateA);
        const dateB = new Date(dueDateB);
        
        const isValidA = !isNaN(dateA.getTime());
        const isValidB = !isNaN(dateB.getTime());
        
        if (isValidA && isValidB) {
            return dateA.getTime() - dateB.getTime();
        }
        
        if (isValidA && !isValidB) return -1;
        if (!isValidA && isValidB) return 1;
        
        return dueDateA.localeCompare(dueDateB);
    });
}
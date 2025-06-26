import { SortOptions } from './interfaces';
import { TodoInterface } from './parser';

export function sortTodosByPriority(todos: TodoInterface[], options: SortOptions = {}): TodoInterface[] {
    const { completedTasksLast = false } = options;
    
    return [...todos].sort((a, b) => {
        // Handle completed tasks first if option is enabled
        if (completedTasksLast) {
            if (a.isDone() !== b.isDone()) {
                return a.isDone() ? 1 : -1;
            }
        }
        
        const priorityA = a.priority();
        const priorityB = b.priority();
        
        // Handle null priorities (tasks without priority go last)
        if (priorityA === null && priorityB === null) return 0;
        if (priorityA === null) return 1;
        if (priorityB === null) return -1;
        
        // Compare priorities
        // Numeric priorities come first, then alphabetic
        const isNumericA = /^\d+$/.test(priorityA);
        const isNumericB = /^\d+$/.test(priorityB);
        
        if (isNumericA && isNumericB) {
            return parseInt(priorityA) - parseInt(priorityB);
        }
        
        if (isNumericA && !isNumericB) return -1;
        if (!isNumericA && isNumericB) return 1;
        
        // Both are alphabetic
        return priorityA.localeCompare(priorityB);
    });
}

export function sortTodosByProject(todos: TodoInterface[], options: SortOptions = {}): TodoInterface[] {
    const { caseSensitive = false } = options;
    
    return [...todos].sort((a, b) => {
        const projectsA = a.projects();
        const projectsB = b.projects();
        
        // Handle tasks without projects (go last)
        if (projectsA.length === 0 && projectsB.length === 0) return 0;
        if (projectsA.length === 0) return 1;
        if (projectsB.length === 0) return -1;
        
        // Use first project for comparison
        const projectA = projectsA[0];
        const projectB = projectsB[0];
        
        if (caseSensitive) {
            return projectA.localeCompare(projectB);
        } else {
            return projectA.toLowerCase().localeCompare(projectB.toLowerCase());
        }
    });
}

export function sortTodosByContext(todos: TodoInterface[], options: SortOptions = {}): TodoInterface[] {
    const { caseSensitive = false } = options;
    
    return [...todos].sort((a, b) => {
        const contextsA = a.contexts();
        const contextsB = b.contexts();
        
        // Handle tasks without contexts (go last)
        if (contextsA.length === 0 && contextsB.length === 0) return 0;
        if (contextsA.length === 0) return 1;
        if (contextsB.length === 0) return -1;
        
        // Use first context for comparison
        const contextA = contextsA[0];
        const contextB = contextsB[0];
        
        if (caseSensitive) {
            return contextA.localeCompare(contextB);
        } else {
            return contextA.toLowerCase().localeCompare(contextB.toLowerCase());
        }
    });
}

export function sortTodosByDueDate(todos: TodoInterface[], options: SortOptions = {}): TodoInterface[] {
    return [...todos].sort((a, b) => {
        const dueDateA = a.dueDate();
        const dueDateB = b.dueDate();
        
        // Handle tasks without due dates (go last)
        if (dueDateA === null && dueDateB === null) return 0;
        if (dueDateA === null) return 1;
        if (dueDateB === null) return -1;
        
        // Try to parse dates
        const dateA = new Date(dueDateA);
        const dateB = new Date(dueDateB);
        
        // Handle invalid dates (go after valid dates but before null)
        const isValidA = !isNaN(dateA.getTime());
        const isValidB = !isNaN(dateB.getTime());
        
        if (isValidA && isValidB) {
            return dateA.getTime() - dateB.getTime();
        }
        
        if (isValidA && !isValidB) return -1;
        if (!isValidA && isValidB) return 1;
        
        // Both invalid dates, use string comparison
        return dueDateA.localeCompare(dueDateB);
    });
}
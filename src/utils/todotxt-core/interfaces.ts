export type SortType = 'priority' | 'project' | 'context' | 'dueDate';

export interface SortOptions {
    completedTasksLast?: boolean;
    caseSensitive?: boolean;
}
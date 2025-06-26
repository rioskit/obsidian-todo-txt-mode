import { parseTodo } from '../parser';
import { sortTodosByPriority, sortTodosByProject, sortTodosByContext, sortTodosByDueDate } from '../sorter';

describe('Todo Sorter Functions', () => {
    describe('sortTodosByPriority', () => {
        test('sorts tasks by priority A, B, C', () => {
            const todos = [
                parseTodo('(C) Low priority task'),
                parseTodo('(A) High priority task'),
                parseTodo('(B) Medium priority task'),
                parseTodo('No priority task')
            ];

            const sorted = sortTodosByPriority(todos);
            
            expect(sorted[0].priority()).toBe('A');
            expect(sorted[1].priority()).toBe('B');
            expect(sorted[2].priority()).toBe('C');
            expect(sorted[3].priority()).toBeNull();
        });

        test('handles numeric priorities correctly', () => {
            const todos = [
                parseTodo('(3) Priority 3 task'),
                parseTodo('(1) Priority 1 task'),
                parseTodo('(2) Priority 2 task'),
                parseTodo('(A) Priority A task')
            ];

            const sorted = sortTodosByPriority(todos);
            
            expect(sorted[0].priority()).toBe('1');
            expect(sorted[1].priority()).toBe('2');
            expect(sorted[2].priority()).toBe('3');
            expect(sorted[3].priority()).toBe('A');
        });

        test('puts completed tasks last when option is enabled', () => {
            const todos = [
                parseTodo('x (A) Completed high priority'),
                parseTodo('(B) Active medium priority'),
                parseTodo('x (C) Completed low priority'),
                parseTodo('(A) Active high priority')
            ];

            const sorted = sortTodosByPriority(todos, { completedTasksLast: true });
            
            expect(sorted[0].priority()).toBe('A');
            expect(sorted[0].isDone()).toBe(false);
            expect(sorted[1].priority()).toBe('B');
            expect(sorted[1].isDone()).toBe(false);
            expect(sorted[2].priority()).toBeNull();
            expect(sorted[2].isDone()).toBe(true);
            expect(sorted[3].priority()).toBeNull();
            expect(sorted[3].isDone()).toBe(true);
        });

        test('maintains original order for same priority', () => {
            const todos = [
                parseTodo('(A) First A task'),
                parseTodo('(A) Second A task'),
                parseTodo('(A) Third A task')
            ];

            const sorted = sortTodosByPriority(todos);
            
            expect(sorted[0].task()).toBe('First A task');
            expect(sorted[1].task()).toBe('Second A task');
            expect(sorted[2].task()).toBe('Third A task');
        });
    });

    describe('sortTodosByProject', () => {
        test('sorts tasks by project name alphabetically', () => {
            const todos = [
                parseTodo('Task with +zebra project'),
                parseTodo('Task with +apple project'),
                parseTodo('Task with +banana project'),
                parseTodo('Task without project')
            ];

            const sorted = sortTodosByProject(todos);
            
            expect(sorted[0].projects()).toEqual(['apple']);
            expect(sorted[1].projects()).toEqual(['banana']);
            expect(sorted[2].projects()).toEqual(['zebra']);
            expect(sorted[3].projects()).toEqual([]);
        });

        test('handles multiple projects by using first project', () => {
            const todos = [
                parseTodo('Task with +zebra +apple projects'),
                parseTodo('Task with +banana +charlie projects')
            ];

            const sorted = sortTodosByProject(todos);
            
            expect(sorted[0].projects()).toEqual(['banana', 'charlie']);
            expect(sorted[1].projects()).toEqual(['zebra', 'apple']);
        });

        test('case sensitive sorting when option is enabled', () => {
            const todos = [
                parseTodo('Task with +Zebra project'),
                parseTodo('Task with +apple project'),
                parseTodo('Task with +Banana project')
            ];

            const sorted = sortTodosByProject(todos, { caseSensitive: true });
            
            // Case sensitive: lowercase letters come before uppercase in localeCompare
            expect(sorted[0].projects()).toEqual(['apple']);
            expect(sorted[1].projects()).toEqual(['Banana']);
            expect(sorted[2].projects()).toEqual(['Zebra']);
        });

        test('case insensitive sorting by default', () => {
            const todos = [
                parseTodo('Task with +Zebra project'),
                parseTodo('Task with +apple project'),
                parseTodo('Task with +Banana project')
            ];

            const sorted = sortTodosByProject(todos);
            
            expect(sorted[0].projects()).toEqual(['apple']);
            expect(sorted[1].projects()).toEqual(['Banana']);
            expect(sorted[2].projects()).toEqual(['Zebra']);
        });
    });

    describe('sortTodosByContext', () => {
        test('sorts tasks by context name alphabetically', () => {
            const todos = [
                parseTodo('Task with @work context'),
                parseTodo('Task with @home context'),
                parseTodo('Task with @phone context'),
                parseTodo('Task without context')
            ];

            const sorted = sortTodosByContext(todos);
            
            expect(sorted[0].contexts()).toEqual(['home']);
            expect(sorted[1].contexts()).toEqual(['phone']);
            expect(sorted[2].contexts()).toEqual(['work']);
            expect(sorted[3].contexts()).toEqual([]);
        });

        test('handles multiple contexts by using first context', () => {
            const todos = [
                parseTodo('Task with @work @urgent contexts'),
                parseTodo('Task with @home @weekend contexts')
            ];

            const sorted = sortTodosByContext(todos);
            
            expect(sorted[0].contexts()).toEqual(['home', 'weekend']);
            expect(sorted[1].contexts()).toEqual(['work', 'urgent']);
        });
    });

    describe('sortTodosByDueDate', () => {
        test('sorts tasks by due date chronologically', () => {
            const todos = [
                parseTodo('Task due:2025-01-20'),
                parseTodo('Task due:2025-01-15'),
                parseTodo('Task due:2025-01-18'),
                parseTodo('Task without due date')
            ];

            const sorted = sortTodosByDueDate(todos);
            
            expect(sorted[0].dueDate()).toBe('2025-01-15');
            expect(sorted[1].dueDate()).toBe('2025-01-18');
            expect(sorted[2].dueDate()).toBe('2025-01-20');
            expect(sorted[3].dueDate()).toBeNull();
        });

        test('handles invalid dates by putting them last', () => {
            const todos = [
                parseTodo('Task due:2025-01-15'),
                parseTodo('Task due:invalid-date'),
                parseTodo('Task due:2025-01-10'),
                parseTodo('Task without due date')
            ];

            const sorted = sortTodosByDueDate(todos);
            
            expect(sorted[0].dueDate()).toBe('2025-01-10');
            expect(sorted[1].dueDate()).toBe('2025-01-15');
            expect(sorted[2].dueDate()).toBe('invalid-date');
            expect(sorted[3].dueDate()).toBeNull();
        });

        test('puts tasks without due date last', () => {
            const todos = [
                parseTodo('Task without due date'),
                parseTodo('Task due:2025-01-15'),
                parseTodo('Another task without due date')
            ];

            const sorted = sortTodosByDueDate(todos);
            
            expect(sorted[0].dueDate()).toBe('2025-01-15');
            expect(sorted[1].dueDate()).toBeNull();
            expect(sorted[2].dueDate()).toBeNull();
        });
    });

    describe('Complex sorting scenarios', () => {
        test('all sort functions preserve original todo objects', () => {
            const originalTodos = [
                parseTodo('(B) Task with +project @context due:2025-01-15'),
                parseTodo('(A) Another task')
            ];

            const sortedByPriority = sortTodosByPriority(originalTodos);
            const sortedByProject = sortTodosByProject(originalTodos);
            const sortedByContext = sortTodosByContext(originalTodos);
            const sortedByDueDate = sortTodosByDueDate(originalTodos);

            // Check that original objects are preserved (not cloned)
            expect(sortedByPriority[0]).toBe(originalTodos[1]);
            expect(sortedByPriority[1]).toBe(originalTodos[0]);
            
            // All arrays should contain the same objects
            expect(sortedByPriority).toHaveLength(2);
            expect(sortedByProject).toHaveLength(2);
            expect(sortedByContext).toHaveLength(2);
            expect(sortedByDueDate).toHaveLength(2);
        });

        test('empty array handling', () => {
            const empty: any[] = [];
            
            expect(sortTodosByPriority(empty)).toEqual([]);
            expect(sortTodosByProject(empty)).toEqual([]);
            expect(sortTodosByContext(empty)).toEqual([]);
            expect(sortTodosByDueDate(empty)).toEqual([]);
        });

        test('single item array handling', () => {
            const singleTodo = [parseTodo('(A) Single task +project @context due:2025-01-15')];
            
            expect(sortTodosByPriority(singleTodo)).toHaveLength(1);
            expect(sortTodosByProject(singleTodo)).toHaveLength(1);
            expect(sortTodosByContext(singleTodo)).toHaveLength(1);
            expect(sortTodosByDueDate(singleTodo)).toHaveLength(1);
            
            expect(sortTodosByPriority(singleTodo)[0]).toBe(singleTodo[0]);
        });
    });
});
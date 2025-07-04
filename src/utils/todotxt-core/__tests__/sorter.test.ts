import { parseTodo } from '../parser';
import { sortTodosByPriority, sortTodosByProject, sortTodosByContext, sortTodosByDueDate } from '../sorter';

describe('Todo Sorter Functions', () => {
    const createTestTodos = (todoTexts: string[]) => todoTexts.map(text => parseTodo(text));
    describe('sortTodosByPriority', () => {
        const priorityTests = [
            {
                name: 'alphabetic priorities A, B, C',
                input: ['(C) Low priority task', '(A) High priority task', '(B) Medium priority task', 'No priority task'],
                expected: ['A', 'B', 'C', null]
            },
            {
                name: 'numeric priorities',
                input: ['(3) Priority 3 task', '(1) Priority 1 task', '(2) Priority 2 task', '(A) Priority A task'],
                expected: ['1', '2', '3', 'A']
            }
        ];
        
        priorityTests.forEach(({ name, input, expected }) => {
            it(`should sort ${name}`, () => {
                const todos = createTestTodos(input);
                const sorted = sortTodosByPriority(todos);
                sorted.forEach((todo, index) => {
                    expect(todo.priority()).toBe(expected[index]);
                });
            });
        });
        
        it('puts completed tasks last when option is enabled', () => {
            const todos = createTestTodos([
                'x (A) Completed high priority',
                '(B) Active medium priority',
                'x (C) Completed low priority',
                '(A) Active high priority'
            ]);
            const sorted = sortTodosByPriority(todos, { completedTasksLast: true });
            const expectedOrder = [['A', false], ['B', false], ['A', true], ['C', true]];
            sorted.forEach((todo, index) => {
                expect(todo.priority()).toBe(expectedOrder[index][0]);
                expect(todo.isDone()).toBe(expectedOrder[index][1]);
            });
        });
        
        it('maintains original order for same priority', () => {
            const todos = createTestTodos(['(A) First A task', '(A) Second A task', '(A) Third A task']);
            const sorted = sortTodosByPriority(todos);
            const expectedTasks = ['First A task', 'Second A task', 'Third A task'];
            sorted.forEach((todo, index) => {
                expect(todo.task()).toBe(expectedTasks[index]);
            });
        });
    });
    describe('sortTodosByProject', () => {
        const projectTests = [
            {
                name: 'alphabetically',
                input: ['Task with +zebra project', 'Task with +apple project', 'Task with +banana project', 'Task without project'],
                expected: [['apple'], ['banana'], ['zebra'], []]
            },
            {
                name: 'multiple projects by first project',
                input: ['Task with +zebra +apple projects', 'Task with +banana +charlie projects'],
                expected: [['banana', 'charlie'], ['zebra', 'apple']]
            }
        ];
        
        projectTests.forEach(({ name, input, expected }) => {
            it(`should sort ${name}`, () => {
                const todos = createTestTodos(input);
                const sorted = sortTodosByProject(todos);
                sorted.forEach((todo, index) => {
                    expect(todo.projects()).toEqual(expected[index]);
                });
            });
        });
        
        const caseSensitivityTests = [
            {
                name: 'case sensitive sorting when option is enabled',
                caseSensitive: true,
                expected: [['apple'], ['Banana'], ['Zebra']]
            },
            {
                name: 'case insensitive sorting by default',
                caseSensitive: false,
                expected: [['apple'], ['Banana'], ['Zebra']]
            }
        ];
        
        caseSensitivityTests.forEach(({ name, caseSensitive, expected }) => {
            it(name, () => {
                const todos = createTestTodos(['Task with +Zebra project', 'Task with +apple project', 'Task with +Banana project']);
                const sorted = sortTodosByProject(todos, { caseSensitive });
                sorted.forEach((todo, index) => {
                    expect(todo.projects()).toEqual(expected[index]);
                });
            });
        });
    });
    describe('sortTodosByContext', () => {
        const contextTests = [
            {
                name: 'alphabetically',
                input: ['Task with @work context', 'Task with @home context', 'Task with @phone context', 'Task without context'],
                expected: [['home'], ['phone'], ['work'], []]
            },
            {
                name: 'multiple contexts by first context',
                input: ['Task with @work @urgent contexts', 'Task with @home @weekend contexts'],
                expected: [['home', 'weekend'], ['work', 'urgent']]
            }
        ];
        
        contextTests.forEach(({ name, input, expected }) => {
            it(`should sort ${name}`, () => {
                const todos = createTestTodos(input);
                const sorted = sortTodosByContext(todos);
                sorted.forEach((todo, index) => {
                    expect(todo.contexts()).toEqual(expected[index]);
                });
            });
        });
    });
    describe('sortTodosByDueDate', () => {
        const dueDateTests = [
            {
                name: 'chronologically',
                input: ['Task due:2025-01-20', 'Task due:2025-01-15', 'Task due:2025-01-18', 'Task without due date'],
                expected: ['2025-01-15', '2025-01-18', '2025-01-20', null]
            },
            {
                name: 'invalid dates last',
                input: ['Task due:2025-01-15', 'Task due:invalid-date', 'Task due:2025-01-10', 'Task without due date'],
                expected: ['2025-01-10', '2025-01-15', 'invalid-date', null]
            },
            {
                name: 'tasks without due date last',
                input: ['Task without due date', 'Task due:2025-01-15', 'Another task without due date'],
                expected: ['2025-01-15', null, null]
            }
        ];
        
        dueDateTests.forEach(({ name, input, expected }) => {
            it(`should sort ${name}`, () => {
                const todos = createTestTodos(input);
                const sorted = sortTodosByDueDate(todos);
                sorted.forEach((todo, index) => {
                    expect(todo.dueDate()).toBe(expected[index]);
                });
            });
        });
    });
    describe('Complex sorting scenarios', () => {
        it('all sort functions preserve original todo objects', () => {
            const originalTodos = createTestTodos([
                '(B) Task with +project @context due:2025-01-15',
                '(A) Another task'
            ]);
            const sortedByPriority = sortTodosByPriority(originalTodos);
            const sortedByProject = sortTodosByProject(originalTodos);
            const sortedByContext = sortTodosByContext(originalTodos);
            const sortedByDueDate = sortTodosByDueDate(originalTodos);
            
            expect(sortedByPriority[0]).toBe(originalTodos[1]);
            expect(sortedByPriority[1]).toBe(originalTodos[0]);
            [sortedByPriority, sortedByProject, sortedByContext, sortedByDueDate].forEach(sorted => {
                expect(sorted).toHaveLength(2);
            });
        });
        
        const edgeCaseTests = [
            {
                name: 'empty array handling',
                input: [],
                expected: []
            },
            {
                name: 'single item array handling',
                input: ['(A) Single task +project @context due:2025-01-15'],
                expected: { length: 1, preserveIdentity: true }
            }
        ];
        
        edgeCaseTests.forEach(({ name, input, expected }) => {
            it(name, () => {
                const todos = createTestTodos(input);
                const sortFunctions = [sortTodosByPriority, sortTodosByProject, sortTodosByContext, sortTodosByDueDate];
                
                sortFunctions.forEach(sortFn => {
                    const sorted = sortFn(todos);
                    if (Array.isArray(expected)) {
                        expect(sorted).toEqual(expected);
                    } else {
                        expect(sorted).toHaveLength(expected.length);
                        if (expected.preserveIdentity && todos.length > 0) {
                            expect(sorted[0]).toBe(todos[0]);
                        }
                    }
                });
            });
        });
    });
});
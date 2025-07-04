import { buildTaskString } from '../string-builder';
import { parseTodo } from '../parser';

describe('buildTaskString', () => {
        const buildStringTests = [
            {
                name: 'simple task',
                input: 'Simple task',
                expected: 'Simple task'
            },
            {
                name: 'task with priority',
                input: '(A) Priority task',
                expected: '(A) Priority task'
            },
            {
                name: 'task with creation date',
                input: '2025-07-01 Task with date',
                expected: '2025-07-01 Task with date'
            },
            {
                name: 'task with projects',
                input: 'Task +work +important',
                expected: 'Task +work +important'
            },
            {
                name: 'task with contexts',
                input: 'Task @office @computer',
                expected: 'Task @office @computer'
            },
            {
                name: 'task with key-values',
                input: 'Task due:2025-07-15 rec:w',
                expected: 'Task due:2025-07-15 rec:w'
            },
            {
                name: 'complex task with all components',
                input: '(A) 2025-07-01 Complex task +work +important @office @computer due:2025-07-15 rec:w',
                expected: '(A) 2025-07-01 Complex task +work +important @office @computer due:2025-07-15 rec:w'
            },
            {
                name: 'completed task',
                input: 'x 2025-07-04 2025-07-01 Completed task +project @context',
                expected: '2025-07-01 Completed task +project @context'
            }
        ];
        
        buildStringTests.forEach(({ name, input, expected }) => {
            it(`should build ${name}`, () => {
                const todo = parseTodo(input);
                const result = buildTaskString(todo);
                expect(result).toBe(expected);
            });
        });
        
        it('should handle round-trip consistency for non-completed tasks', () => {
            const originalStrings = [
                '(A) 2025-07-01 Test task +project @context due:2025-12-31 rec:w',
                'Simple task without metadata',
                '(B) Priority only task',
                'Task +multiple +projects @multiple @contexts'
            ];
            
            originalStrings.forEach(original => {
                const todo = parseTodo(original);
                const rebuilt = buildTaskString(todo);
                const reParsed = parseTodo(rebuilt);
                
                expect(reParsed.task()).toBe(todo.task());
                expect(reParsed.priority()).toBe(todo.priority());
                expect(reParsed.creationDate()).toBe(todo.creationDate());
                expect(reParsed.projects()).toEqual(todo.projects());
                expect(reParsed.contexts()).toEqual(todo.contexts());
                expect(reParsed.keyValues()).toEqual(todo.keyValues());
            });
        });
    });
import { parseTodo } from '../parser';

describe('Todo.txt Parser - Key:Value Pairs', () => {
    describe('Basic Key:Value Parsing', () => {
        const basicKeyValueTests = [
            {
                text: 'Task with due:2025-12-31',
                expected: { keyValues: { due: '2025-12-31' }, task: 'Task with' }
            },
            {
                text: 'Task with due:2025-12-31 rec:1w priority:high',
                expected: { keyValues: { due: '2025-12-31', rec: '1w', priority: 'high' }, task: 'Task with' }
            },
            {
                text: 'due:2025-12-31 Task in middle rec:1w and end note:important',
                expected: { keyValues: { due: '2025-12-31', rec: '1w', note: 'important' }, task: 'Task in middle and end' }
            },
            {
                text: 'Task due:2025-12-31 due:2025-06-30',
                expected: { keyValues: { due: '2025-06-30' }, task: 'Task' }
            }
        ];
        
        basicKeyValueTests.forEach(({ text, expected }) => {
            it(`should parse "${text}" correctly`, () => {
                const todo = parseTodo(text);
                expect(todo.keyValues()).toEqual(expected.keyValues);
                expect(todo.task()).toBe(expected.task);
            });
        });
    });
    describe('Special Key Names and Values', () => {
        const specialKeyValueTests = [
            {
                text: 'Task with t:2025-01-15 p:1',
                expected: { keyValues: { t: '2025-01-15', p: '1' } }
            },
            {
                text: 'Task with custom1:value1 test2:value2',
                expected: { keyValues: { custom1: 'value1', test2: 'value2' } }
            },
            {
                text: 'Task with url:https://example.com time:14:30:00',
                expected: { keyValues: { url: 'https://example.com', time: '14:30:00' } }
            },
            {
                text: 'Task with empty: key',
                expected: { keyValues: {} }
            },
            {
                text: 'Task with special:!@#$%^&*() chars',
                expected: { keyValues: { special: '!@#$%^&*()' } }
            }
        ];
        
        specialKeyValueTests.forEach(({ text, expected }) => {
            it(`should handle "${text}" correctly`, () => {
                const todo = parseTodo(text);
                expect(todo.keyValues()).toEqual(expected.keyValues);
            });
        });
    });
    describe('Standard Key:Value Pairs', () => {
        it('parses due date', () => {
            const todoText = 'Task due:2025-12-31';
            const todo = parseTodo(todoText);
            expect(todo.dueDate()).toBe('2025-12-31');
            expect(todo.keyValues().due).toBe('2025-12-31');
        });
        
        const recurrencePatterns = ['d', '1d', '2w', '3m', '1y', '+1w', 'b', '5b'];
        recurrencePatterns.forEach(pattern => {
            it(`should parse recurrence pattern rec:${pattern}`, () => {
                const todo = parseTodo(`Task rec:${pattern}`);
                expect(todo.keyValues().rec).toBe(pattern);
            });
        });
        
        it('parses custom keys', () => {
            const todoText = 'Task note:important id:123 status:pending';
            const todo = parseTodo(todoText);
            expect(todo.keyValues()).toEqual({
                note: 'important',
                id: '123',
                status: 'pending'
            });
        });
    });
    describe('Non Key:Value Cases', () => {
        const nonKeyValueTests = [
            {
                text: 'Visit https://example.com today',
                expected: { keyValues: { 'https': '//example.com' }, task: 'Visit today' }
            },
            {
                text: 'Meeting at 14:30 sharp',
                expected: { keyValues: {}, task: 'Meeting at 14:30 sharp' }
            },
            {
                text: 'Task with key : value notation',
                expected: { keyValues: {}, task: 'Task with key : value notation' }
            }
        ];
        
        nonKeyValueTests.forEach(({ text, expected }) => {
            it(`should handle "${text}" correctly`, () => {
                const todo = parseTodo(text);
                expect(todo.keyValues()).toEqual(expected.keyValues);
                expect(todo.task()).toBe(expected.task);
            });
        });
    });
    describe('Complex Combinations', () => {
        const complexTests = [
            {
                text: '(A) 2025-01-15 Complex +project @context due:2025-12-31 rec:1w note:test',
                expected: {
                    priority: 'A',
                    creationDate: '2025-01-15',
                    projects: ['project'],
                    contexts: ['context'],
                    keyValues: { due: '2025-12-31', rec: '1w', note: 'test' },
                    task: 'Complex'
                }
            },
            {
                text: 'due:2025-12-31 rec:1w priority:high',
                expected: {
                    keyValues: { due: '2025-12-31', rec: '1w', priority: 'high' },
                    task: ''
                }
            },
            {
                text: 'Task a:1 b:2 c:3 d:4 e:5 f:6 g:7 h:8 i:9 j:10',
                expected: {
                    keyValues: { a: '1', b: '2', c: '3', d: '4', e: '5', f: '6', g: '7', h: '8', i: '9', j: '10' },
                    task: 'Task'
                }
            }
        ];
        
        complexTests.forEach(({ text, expected }) => {
            it(`should parse "${text}" correctly`, () => {
                const todo = parseTodo(text);
                if (expected.priority) expect(todo.priority()).toBe(expected.priority);
                if (expected.creationDate) expect(todo.creationDate()).toBe(expected.creationDate);
                if (expected.projects) expect(todo.projects()).toEqual(expected.projects);
                if (expected.contexts) expect(todo.contexts()).toEqual(expected.contexts);
                expect(todo.keyValues()).toEqual(expected.keyValues);
                expect(todo.task()).toBe(expected.task);
            });
        });
    });
    describe('Position Accuracy', () => {
        it('provides accurate positions for key:value pairs', () => {
            const line = 'Task with due:2025-12-31 and rec:1w here';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            positions.keyValues.forEach(kv => {
                const extracted = line.substring(kv.start, kv.end);
                expect(extracted).toBe(kv.value);
            });
        });
    });
});
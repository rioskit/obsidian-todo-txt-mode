import { parseTodo } from '../parser';
describe('Todo.txt Parser - Priority', () => {
    describe('Alphabetic Priorities', () => {
        it.each([
            ['A', '(A) High priority task'],
            ['B', '(B) Medium priority task'],
            ['C', '(C) Low priority task'],
            ['Z', '(Z) Lowest priority task']
        ])('優先度%sの正確な解析', (expectedPriority, todoText) => {
            const todo = parseTodo(todoText);
            expect(todo.priority()).toBe(expectedPriority);
            expect(todo.task()).toBe(todoText.substring(4)); 
        });
        it('does not accept lowercase priority letters', () => {
            const todoText = '(a) Lowercase priority task';
            const todo = parseTodo(todoText);
            expect(todo.priority()).toBeNull();
            expect(todo.task()).toBe('(a) Lowercase priority task');
        });
    });
    describe('Numeric Priorities', () => {
        it.each([
            ['1', '(1) Single digit priority'],
            ['99', '(99) Double digit priority'],
            ['123', '(123) Triple digit priority'],
            ['999999', '(999999) Very large numeric priority']
        ])('数値優先度%sの正確な解析', (expectedPriority, todoText) => {
            const todo = parseTodo(todoText);
            expect(todo.priority()).toBe(expectedPriority);
        });
        it('accepts zero as valid priority', () => {
            const todoText = '(0) Zero priority task';
            const todo = parseTodo(todoText);
            expect(todo.priority()).toBe('0');
            expect(todo.task()).toBe('Zero priority task');
        });
    });
    describe('Alphanumeric Priorities', () => {
        it.each([
            ['A1', '(A1) Letter first alphanumeric'],
            ['1a', '(1a) Number first alphanumeric'],
            ['A1B2C3', '(A1B2C3) Complex alphanumeric']
        ])('英数字優先度%sの正確な解析', (expectedPriority, todoText) => {
            const todo = parseTodo(todoText);
            expect(todo.priority()).toBe(expectedPriority);
        });
    });
    describe('Priority Position and Combinations', () => {
        const combinationTests = [
            {
                name: 'middle of line',
                text: 'Task with (A) priority in middle',
                expected: { priority: null, task: 'Task with (A) priority in middle' }
            },
            {
                name: 'priority with creation date',
                text: '(A) 2025-01-15 Priority with creation date',
                expected: { priority: 'A', creationDate: '2025-01-15', task: 'Priority with creation date' }
            },
            {
                name: 'completed task with priority',
                text: 'x 2025-01-16 (A) 2025-01-15 Completed task with priority',
                expected: { isDone: true, priority: 'A', completionDate: '2025-01-16', creationDate: null, task: '2025-01-15 Completed task with priority' }
            }
        ];
        
        combinationTests.forEach(({ name, text, expected }) => {
            it(`should handle ${name}`, () => {
                const todo = parseTodo(text);
                if (expected.priority !== undefined) expect(todo.priority()).toBe(expected.priority);
                if (expected.creationDate !== undefined) expect(todo.creationDate()).toBe(expected.creationDate);
                if (expected.isDone !== undefined) expect(todo.isDone()).toBe(expected.isDone);
                if (expected.completionDate !== undefined) expect(todo.completionDate()).toBe(expected.completionDate);
                expect(todo.task()).toBe(expected.task);
            });
        });
    });
    describe('Invalid Priority Formats', () => {
        const invalidFormatTests = [
            {
                name: 'unclosed parenthesis',
                text: '(A Task without closing parenthesis',
                expected: { priority: null }
            },
            {
                name: 'empty parentheses',
                text: '() Empty parentheses task',
                expected: { priority: null }
            },
            {
                name: 'parentheses with spaces',
                text: '( A ) Priority with spaces',
                expected: { priority: null }
            },
            {
                name: 'no space after parenthesis',
                text: '(A)No space after priority',
                expected: { priority: 'A', task: 'No space after priority' }
            }
        ];
        
        invalidFormatTests.forEach(({ name, text, expected }) => {
            it(`should handle ${name}`, () => {
                const todo = parseTodo(text);
                expect(todo.priority()).toBe(expected.priority);
                if (expected.task) {
                    expect(todo.task()).toBe(expected.task);
                } else {
                    expect(todo.task()).toBe(text);
                }
            });
        });
    });
});
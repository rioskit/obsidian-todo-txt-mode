import { parseTodo, isCompletedTask, isDueDateKeyValue, isRecurrenceKeyValue, isCommentLine } from '../parser';
describe('Todo.txt Parser - Integration Tests', () => {
    describe('Factory Pattern Behavior', () => {
        it('returns TodoInterface with all required methods', () => {
            const todo = parseTodo('Test task');
            expect(typeof todo.task).toBe('function');
            expect(typeof todo.isDone).toBe('function');
            expect(typeof todo.priority).toBe('function');
            expect(typeof todo.creationDate).toBe('function');
            expect(typeof todo.completionDate).toBe('function');
            expect(typeof todo.projects).toBe('function');
            expect(typeof todo.contexts).toBe('function');
            expect(typeof todo.keyValues).toBe('function');
            expect(typeof todo.dueDate).toBe('function');
            expect(typeof todo.getElementPositions).toBe('function');
        });
        it('creates immutable todo objects', () => {
            const todoText = 'Task with +project @context';
            const todo1 = parseTodo(todoText);
            const todo2 = parseTodo(todoText);
            expect(todo1).not.toBe(todo2);
            expect(todo1.task()).toBe(todo2.task());
            expect(todo1.projects()).toEqual(todo2.projects());
            expect(todo1.contexts()).toEqual(todo2.contexts());
        });
        it('ensures dueDate method consistency with keyValues', () => {
            const todo = parseTodo('Task due:2025-12-31');
            expect(todo.dueDate()).toBe(todo.keyValues().due);
            expect(todo.dueDate()).toBe('2025-12-31');
        });
    });
    describe('Complex Integration Patterns', () => {
        it('parses task with all possible elements', () => {
            const todoText = '(A) 2025-01-15 Complex task +project1 +project2 @context1 @context2 due:2025-12-31 rec:1w note:test';
            const todo = parseTodo(todoText);
            expect(todo.priority()).toBe('A');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Complex task');
            expect(todo.projects()).toEqual(['project1', 'project2']);
            expect(todo.contexts()).toEqual(['context1', 'context2']);
            expect(todo.dueDate()).toBe('2025-12-31');
            expect(todo.keyValues()).toEqual({
                due: '2025-12-31',
                rec: '1w',
                note: 'test'
            });
        });
        it('parses completed task with all elements', () => {
            const todoText = 'x 2025-01-16 2025-01-15 Completed +project @context due:2025-12-31';
            const todo = parseTodo(todoText);
            expect(todo.isDone()).toBe(true);
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Completed');
            expect(todo.projects()).toEqual(['project']);
            expect(todo.contexts()).toEqual(['context']);
            expect(todo.dueDate()).toBe('2025-12-31');
        });
        it('handles very long task descriptions efficiently', () => {
            const longDescription = 'Very '.repeat(100) + 'long task';
            const todoText = `(A) 2025-01-15 ${longDescription} +project @context due:2025-12-31`;
            const todo = parseTodo(todoText);
            expect(todo.task()).toBe(longDescription);
            expect(todo.priority()).toBe('A');
            expect(todo.projects()).toEqual(['project']);
        });
        it('gracefully handles malformed input', () => {
            const malformedInputs = [
                '(((A))) Multiple parentheses',
                '+++ Multiple plus signs',
                '@@@ Multiple at signs',
                'key::: Multiple colons',
                '::::: Only colons'
            ];
            malformedInputs.forEach(input => {
                expect(() => parseTodo(input)).not.toThrow();
                const todo = parseTodo(input);
                expect(typeof todo.task()).toBe('string');
            });
        });
    });
    describe('Legacy Compatibility Samples', () => {
        it('parses standard Todo.txt format examples', () => {
            const samples = [
                {
                    text: 'Call Mom +Family @phone',
                    expected: {
                        task: 'Call Mom',
                        projects: ['Family'],
                        contexts: ['phone']
                    }
                },
                {
                    text: '(A) Thank Mom for the birthday card +Family @calls',
                    expected: {
                        priority: 'A',
                        task: 'Thank Mom for the birthday card',
                        projects: ['Family'],
                        contexts: ['calls']
                    }
                },
                {
                    text: 'x 2011-03-02 2011-03-01 Call Mom +Family @calls',
                    expected: {
                        isDone: true,
                        completionDate: '2011-03-02',
                        creationDate: '2011-03-01',
                        task: 'Call Mom',
                        projects: ['Family'],
                        contexts: ['calls']
                    }
                }
            ];
            samples.forEach(sample => {
                const todo = parseTodo(sample.text);
                Object.entries(sample.expected).forEach(([key, value]) => {
                    if (key === 'isDone') {
                        expect(todo.isDone()).toBe(value);
                    } else if (key === 'projects') {
                        expect(todo.projects()).toEqual(value);
                    } else if (key === 'contexts') {
                        expect(todo.contexts()).toEqual(value);
                    } else if (key === 'completionDate') {
                        expect(todo.completionDate()).toBe(value);
                    } else if (key === 'creationDate') {
                        expect(todo.creationDate()).toBe(value);
                    } else if (key === 'task') {
                        expect(todo.task()).toBe(value);
                    } else if (key === 'priority') {
                        expect(todo.priority()).toBe(value);
                    }
                });
            });
        });
    });
});
describe('isCompletedTask', () => {
    const completedTaskTests = [
        // True cases
        { text: 'x Simple completed task', expected: true },
        { text: 'x (A) Priority completed task', expected: true },
        { text: 'x 2023-12-20 Task with completion date', expected: true },
        { text: 'x 2023-12-20 2023-12-15 Task with both dates', expected: true },
        { text: '  x Indented completed task', expected: true },
        { text: '\tx Tab indented completed task', expected: true },
        { text: '\t  x Mixed indented completed task', expected: true },
        { text: 'x Task +project @context due:2023-12-20', expected: true },
        { text: '  x (B) 2023-12-20 Complex task +work @office', expected: true },
        // False cases
        { text: 'Incomplete task', expected: false },
        { text: '(A) Priority incomplete task', expected: false },
        { text: '2023-12-20 Task with creation date', expected: false },
        { text: 'Call Mom +Family @phone', expected: false },
        { text: 'x', expected: false },
        { text: 'xCompleted task', expected: false },
        { text: 'X Uppercase x', expected: false },
        { text: 'xx Double x', expected: false },
        { text: '', expected: false },
        { text: '   ', expected: false },
        { text: '\t\t', expected: false },
        { text: 'Not x in middle', expected: false },
        { text: 'End with x', expected: false }
    ];
    
    completedTaskTests.forEach(({ text, expected }) => {
        it(`should return ${expected} for "${text}"`, () => {
            expect(isCompletedTask(text)).toBe(expected);
        });
    });
});
describe('isDueDateKeyValue', () => {
    const dueDateTests = [
        { text: 'due:2023-12-20', expected: true },
        { text: 'due:2023-01-01', expected: true },
        { text: 'due:', expected: true },
        { text: 'rec:d', expected: false },
        { text: 'priority:A', expected: false },
        { text: 'project:work', expected: false },
        { text: 'duedate:2023-12-20', expected: false },
        { text: 'due 2023-12-20', expected: false },
        { text: '', expected: false },
        { text: 'due', expected: false },
        { text: ':due:2023-12-20', expected: false }
    ];
    
    dueDateTests.forEach(({ text, expected }) => {
        it(`should return ${expected} for "${text}"`, () => {
            expect(isDueDateKeyValue(text)).toBe(expected);
        });
    });
});
describe('isRecurrenceKeyValue', () => {
    const recurrenceTests = [
        { text: 'rec:d', expected: true },
        { text: 'rec:w', expected: true },
        { text: 'rec:m', expected: true },
        { text: 'rec:+1d', expected: true },
        { text: 'rec:', expected: true },
        { text: 'due:2023-12-20', expected: false },
        { text: 'priority:A', expected: false },
        { text: 'repeat:d', expected: false },
        { text: 'rec d', expected: false },
        { text: '', expected: false },
        { text: 'rec', expected: false },
        { text: ':rec:d', expected: false }
    ];
    
    recurrenceTests.forEach(({ text, expected }) => {
        it(`should return ${expected} for "${text}"`, () => {
            expect(isRecurrenceKeyValue(text)).toBe(expected);
        });
    });
});
describe('isCommentLine', () => {
    const commentLineTests = [
        { text: '# This is a comment', expected: true },
        { text: '#Another comment', expected: true },
        { text: '# Comment with multiple words', expected: true },
        { text: '#', expected: true },
        { text: '  # Indented comment', expected: true },
        { text: '\t# Tab indented comment', expected: true },
        { text: '   \t  # Mixed whitespace comment', expected: true },
        { text: '## Double hash', expected: true },
        { text: 'Task without hash', expected: false },
        { text: '(A) Priority task', expected: false },
        { text: 'x Completed task', expected: false },
        { text: 'Task with # hash in middle', expected: false },
        { text: 'Task ending with #', expected: false },
        { text: '', expected: false },
        { text: '   ', expected: false },
        { text: '\t\t', expected: false }
    ];
    
    commentLineTests.forEach(({ text, expected }) => {
        it(`should return ${expected} for "${text}"`, () => {
            expect(isCommentLine(text)).toBe(expected);
        });
    });
});
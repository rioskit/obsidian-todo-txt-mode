import { parseTodo } from '../parser';

describe('Todo.txt Parser - Dates', () => {
    describe('Creation Date', () => {
        const creationDateTests = [
            {
                text: '2025-01-15 Task with creation date',
                expected: { creationDate: '2025-01-15', task: 'Task with creation date' }
            },
            {
                text: '(A) 2025-01-15 Priority task with creation date',
                expected: { priority: 'A', creationDate: '2025-01-15', task: 'Priority task with creation date' }
            },
            {
                text: '01-15-2025 American date format not accepted',
                expected: { creationDate: null, task: '01-15-2025 American date format not accepted' }
            },
            {
                text: 'Task with 2025-01-15 date in middle',
                expected: { creationDate: null, task: 'Task with 2025-01-15 date in middle' }
            }
        ];
        
        creationDateTests.forEach(({ text, expected }) => {
            it(`should parse "${text}" correctly`, () => {
                const todo = parseTodo(text);
                expect(todo.creationDate()).toBe(expected.creationDate);
                expect(todo.task()).toBe(expected.task);
                if (expected.priority) {
                    expect(todo.priority()).toBe(expected.priority);
                }
            });
        });
    });
    describe('Completion Date', () => {
        const completionDateTests = [
            {
                text: 'x 2025-01-16 Simple completed task',
                expected: { isDone: true, completionDate: '2025-01-16', creationDate: null, task: 'Simple completed task' }
            },
            {
                text: 'x 2025-01-16 2025-01-15 Task completed one day after creation',
                expected: { isDone: true, completionDate: '2025-01-16', creationDate: '2025-01-15', task: 'Task completed one day after creation' }
            },
            {
                text: '2025-01-16 Not a completion date',
                expected: { isDone: false, completionDate: null, creationDate: '2025-01-16', task: 'Not a completion date' }
            }
        ];
        
        completionDateTests.forEach(({ text, expected }) => {
            it(`should parse "${text}" correctly`, () => {
                const todo = parseTodo(text);
                expect(todo.isDone()).toBe(expected.isDone);
                expect(todo.completionDate()).toBe(expected.completionDate);
                expect(todo.creationDate()).toBe(expected.creationDate);
                expect(todo.task()).toBe(expected.task);
            });
        });
    });
    describe('Due Date', () => {
        const dueDateTests = [
            {
                text: 'Task with due:2025-12-31',
                expected: { dueDate: '2025-12-31', keyValue: '2025-12-31' }
            },
            {
                text: '(A) 2025-01-15 Task +project @context due:2025-12-31 rec:1w',
                expected: { dueDate: '2025-12-31' }
            },
            {
                text: 'Task with precise time due:2025-12-31T14:30:00',
                expected: { dueDate: '2025-12-31T14:30:00' }
            },
            {
                text: 'Task due:2025-12-31 with another due:2025-06-30',
                expected: { dueDate: '2025-06-30', keyValue: '2025-06-30' }
            }
        ];
        
        dueDateTests.forEach(({ text, expected }) => {
            it(`should parse "${text}" correctly`, () => {
                const todo = parseTodo(text);
                expect(todo.dueDate()).toBe(expected.dueDate);
                if (expected.keyValue) {
                    expect(todo.keyValues()).toHaveProperty('due', expected.keyValue);
                }
            });
        });
    });
    describe('Date Validation', () => {
        const validDateTests = [
            { date: '2025-13-01', expected: '2025-13-01' },
            { date: '2024-02-29', expected: '2024-02-29' },
            { date: '2025-02-29', expected: '2025-02-29' }
        ];
        
        validDateTests.forEach(({ date, expected }) => {
            it(`should accept ${date} as valid format`, () => {
                const todo = parseTodo(`${date} Task with format-valid date`);
                expect(todo.creationDate()).toBe(expected);
                expect(todo.task()).toBe('Task with format-valid date');
            });
        });
        
        const invalidDateFormats = ['2025-1-1', '25-01-01', 'today', '01-15-2025'];
        invalidDateFormats.forEach(date => {
            it(`should reject ${date} as invalid format`, () => {
                const todo = parseTodo(`${date} Task with invalid format`);
                expect(todo.creationDate()).toBeNull();
                expect(todo.task()).toBe(`${date} Task with invalid format`);
            });
        });
    });
    describe('Complex Date Combinations', () => {
        const complexDateTests = [
            {
                text: 'x 2025-01-16 2025-01-15 Complex task due:2025-12-31',
                expected: { isDone: true, completionDate: '2025-01-16', creationDate: '2025-01-15', dueDate: '2025-12-31' }
            },
            {
                text: 'x 2025-01-15 2025-01-16 Completion before creation',
                expected: { completionDate: '2025-01-15', creationDate: '2025-01-16' }
            }
        ];
        
        complexDateTests.forEach(({ text, expected }) => {
            it(`should parse "${text}" correctly`, () => {
                const todo = parseTodo(text);
                if (expected.isDone !== undefined) expect(todo.isDone()).toBe(expected.isDone);
                if (expected.completionDate !== undefined) expect(todo.completionDate()).toBe(expected.completionDate);
                if (expected.creationDate !== undefined) expect(todo.creationDate()).toBe(expected.creationDate);
                if (expected.dueDate !== undefined) expect(todo.dueDate()).toBe(expected.dueDate);
            });
        });
    });
});
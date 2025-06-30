/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { 
    parseRecurrence, 
    addInterval, 
    getNextRecurringTask,
    parseTodo 
} from '../';
const originalDate = global.Date;
const mockDate = new Date('2023-05-08');
beforeAll(() => {
    global.Date = jest.fn((dateString?: string) => {
        if (dateString) {
            return new originalDate(dateString);
        }
        return mockDate;
    }) as unknown as DateConstructor;
    global.Date.now = originalDate.now;
    global.Date.parse = originalDate.parse;
    global.Date.UTC = originalDate.UTC;
});
afterAll(() => {
    global.Date = originalDate;
});
describe('parseRecurrence', () => {
    const recurrenceParseTests = [
        // Valid cases
        { pattern: 'd', expected: { interval: 'd', amount: 1, isStrict: false } },
        { pattern: 'w', expected: { interval: 'w', amount: 1, isStrict: false } },
        { pattern: 'm', expected: { interval: 'm', amount: 1, isStrict: false } },
        { pattern: 'y', expected: { interval: 'y', amount: 1, isStrict: false } },
        { pattern: 'b', expected: { interval: 'b', amount: 1, isStrict: false } },
        { pattern: '3d', expected: { interval: 'd', amount: 3, isStrict: false } },
        { pattern: '2w', expected: { interval: 'w', amount: 2, isStrict: false } },
        { pattern: '6m', expected: { interval: 'm', amount: 6, isStrict: false } },
        { pattern: '1y', expected: { interval: 'y', amount: 1, isStrict: false } },
        { pattern: '5b', expected: { interval: 'b', amount: 5, isStrict: false } },
        { pattern: '+d', expected: { interval: 'd', amount: 1, isStrict: true } },
        { pattern: '+3m', expected: { interval: 'm', amount: 3, isStrict: true } },
        { pattern: '+2w', expected: { interval: 'w', amount: 2, isStrict: true } },
        // Invalid cases
        { pattern: '', expected: null },
        { pattern: 'x', expected: null },
        { pattern: '0d', expected: null },
        { pattern: '-1d', expected: null },
        { pattern: 'dm', expected: null },
        { pattern: '3', expected: null }
    ];
    
    recurrenceParseTests.forEach(({ pattern, expected }) => {
        it(`should parse "${pattern}" as ${expected ? JSON.stringify(expected) : 'null'}`, () => {
            expect(parseRecurrence(pattern)).toEqual(expected);
        });
    });
});
describe('addInterval', () => {
    const intervalTests = [
        // Days
        { date: '2023-05-08', interval: { interval: 'd', amount: 1, isStrict: false }, expected: '2023-05-09' },
        { date: '2023-05-08', interval: { interval: 'd', amount: 5, isStrict: false }, expected: '2023-05-13' },
        // Weeks
        { date: '2023-05-08', interval: { interval: 'w', amount: 1, isStrict: false }, expected: '2023-05-15' },
        { date: '2023-05-08', interval: { interval: 'w', amount: 2, isStrict: false }, expected: '2023-05-22' },
        // Months
        { date: '2023-05-08', interval: { interval: 'm', amount: 1, isStrict: false }, expected: '2023-06-08' },
        { date: '2023-05-08', interval: { interval: 'm', amount: 3, isStrict: false }, expected: '2023-08-08' },
        // Years
        { date: '2023-05-08', interval: { interval: 'y', amount: 1, isStrict: false }, expected: '2024-05-08' },
        { date: '2023-05-08', interval: { interval: 'y', amount: 2, isStrict: false }, expected: '2025-05-08' },
        // Business days
        { date: '2023-05-08', interval: { interval: 'b', amount: 1, isStrict: false }, expected: '2023-05-09' },
        { date: '2023-05-08', interval: { interval: 'b', amount: 5, isStrict: false }, expected: '2023-05-15' },
        { date: '2023-05-12', interval: { interval: 'b', amount: 3, isStrict: false }, expected: '2023-05-17' }
    ];
    
    intervalTests.forEach(({ date, interval, expected }) => {
        it(`should add ${interval.amount}${interval.interval} to ${date} = ${expected}`, () => {
            expect(addInterval(date, interval as { interval: 'b' | 'd' | 'w' | 'm' | 'y'; amount: number; isStrict: boolean })).toBe(expected);
        });
    });
});
describe('getNextRecurringTask', () => {
    it('should return null for tasks without recurrence', () => {
        const todo = parseTodo('Task without recurrence');
        expect(getNextRecurringTask(todo)).toBeNull();
    });
    
    const nextTaskTests = [
        {
            name: 'daily recurrence',
            input: 'Daily task rec:d due:2023-05-08',
            expectations: {
                task: 'Daily task',
                dueDate: '2023-05-09',
                rec: 'd',
                creationDate: '2023-05-08'
            }
        },
        {
            name: 'weekly recurrence with tags',
            input: 'Weekly meeting +project @work rec:w due:2023-05-08',
            expectations: {
                task: 'Weekly meeting',
                dueDate: '2023-05-15',
                projects: 'project',
                contexts: 'work'
            }
        },
        {
            name: 'strict mode with due date',
            input: 'x 2023-05-10 2023-05-01 Monthly rent rec:+m due:2023-05-01',
            expectations: {
                task: 'Monthly rent',
                dueDate: '2023-06-01',
                isDone: false
            }
        },
        {
            name: 'strict mode without due date',
            input: 'x 2023-05-10 Task rec:+w',
            expectations: {
                dueDate: '2023-05-17'
            }
        },
        {
            name: 'priority preservation',
            input: '(A) Important task rec:d due:2023-05-08',
            expectations: {
                priority: 'A'
            }
        },
        {
            name: 'completed task priority extraction',
            input: 'x 2023-05-08 (A) 2023-05-07 Completed task rec:d',
            expectations: {
                priority: 'A'
            }
        },
        {
            name: 'key-value preservation',
            input: 'Task rec:m due:2023-05-08 note:important id:123',
            expectations: {
                keyValues: { note: 'important', id: '123', rec: 'm' }
            }
        },
        {
            name: 'business day recurrence',
            input: 'x 2023-05-12 Business task rec:2b due:2023-05-11',
            expectations: {
                dueDate: '2023-05-16'
            }
        },
        {
            name: 'creation date reset',
            input: 'x 2023-05-08 2023-05-01 Task with creation date rec:d due:2023-05-08',
            expectations: {
                creationDate: '2023-05-08',
                task: 'Task with creation date',
                dueDate: '2023-05-09'
            }
        },
        {
            name: 'non-strict mode completion date calculation',
            input: 'x 2023-05-08 2023-05-01 hoge rec:d due:2023-05-03',
            expectations: {
                creationDate: '2023-05-08',
                task: 'hoge',
                dueDate: '2023-05-09'
            }
        }
    ];
    
    nextTaskTests.forEach(({ name, input, expectations }) => {
        it(`should handle ${name}`, () => {
            const todo = parseTodo(input);
            const next = getNextRecurringTask(todo);
            expect(next).not.toBeNull();
            
            if (expectations.task) expect(next!.task()).toBe(expectations.task);
            if (expectations.dueDate) expect(next!.dueDate()).toBe(expectations.dueDate);
            if (expectations.rec) expect(next!.keyValues().rec).toBe(expectations.rec);
            if (expectations.creationDate) expect(next!.creationDate()).toBe(expectations.creationDate);
            if (expectations.projects) expect(next!.projects()).toContain(expectations.projects);
            if (expectations.contexts) expect(next!.contexts()).toContain(expectations.contexts);
            if (expectations.isDone !== undefined) expect(next!.isDone()).toBe(expectations.isDone);
            if (expectations.priority) expect(next!.priority()).toBe(expectations.priority);
            if (expectations.keyValues) {
                Object.entries(expectations.keyValues).forEach(([key, value]) => {
                    expect(next!.keyValues()[key]).toBe(value);
                });
            }
        });
    });
});
import { parseTodo } from '../parser';

describe('Todo.txt Parser - Basic Functionality', () => {
    const expectBasicTaskProperties = (todo: ReturnType<typeof parseTodo>, expectedTask: string, expectedDone = false) => {
        expect(todo.task()).toBe(expectedTask);
        expect(todo.isDone()).toBe(expectedDone);
        expect(todo.priority()).toBeNull();
        expect(todo.creationDate()).toBeNull();
        expect(todo.completionDate()).toBeNull();
        expect(todo.projects()).toEqual([]);
        expect(todo.contexts()).toEqual([]);
        expect(todo.keyValues()).toEqual({});
        expect(todo.dueDate()).toBeNull();
    };
    describe('Simple Tasks', () => {
        it('should extract task text from line without special syntax elements', () => {
            const todoText = 'Simple task without any parameters';
            const todo = parseTodo(todoText);
            expectBasicTaskProperties(todo, 'Simple task without any parameters');
        });
        it('should return empty task for empty string input', () => {
            const todoText = '';
            const todo = parseTodo(todoText);
            expectBasicTaskProperties(todo, '');
        });
        it('should return empty task for whitespace-only string', () => {
            const todoText = '   ';
            const todo = parseTodo(todoText);
            expectBasicTaskProperties(todo, '');
        });
    });
    describe('Completed Tasks', () => {
        it('should mark task as completed when line starts with "x "', () => {
            const todoText = 'x Simple completed task';
            const todo = parseTodo(todoText);
            expect(todo.isDone()).toBe(true);
            expect(todo.task()).toBe('Simple completed task');
        });
        
        const testCases = [
            { text: 'X Not a completed task', expected: 'X Not a completed task', done: false },
            { text: 'xNot a completed task', expected: 'xNot a completed task', done: false }
        ];
        
        testCases.forEach(({ text, expected, done }) => {
            it(`should handle case "${text}" correctly`, () => {
                const todo = parseTodo(text);
                expect(todo.isDone()).toBe(done);
                expect(todo.task()).toBe(expected);
            });
        });
    });
    describe('Whitespace Handling', () => {
        const whitespaceTestCases = [
            { text: '     Task with leading spaces', expected: 'Task with leading spaces' },
            { text: 'Task with trailing spaces     ', expected: 'Task with trailing spaces' },
            { text: '\t\tTask with tab indentation', expected: 'Task with tab indentation' }
        ];
        
        whitespaceTestCases.forEach(({ text, expected }) => {
            it(`should handle whitespace in "${text}"`, () => {
                const todo = parseTodo(text);
                expect(todo.task()).toBe(expected);
            });
        });
    });
    describe('Special Characters', () => {
        const specialCharTestCases = [
            { text: 'Task with emoji 🎯 in description', expected: 'Task with emoji 🎯 in description' },
            { text: 'タスクの説明に日本語を含む', expected: 'タスクの説明に日本語を含む' },
            { text: 'Task with !@#$%^&*() special chars', expected: 'Task with !@#$%^&*() special chars' }
        ];
        
        specialCharTestCases.forEach(({ text, expected }) => {
            it(`should preserve special characters in "${text}"`, () => {
                const todo = parseTodo(text);
                expect(todo.task()).toBe(expected);
            });
        });
    });
});
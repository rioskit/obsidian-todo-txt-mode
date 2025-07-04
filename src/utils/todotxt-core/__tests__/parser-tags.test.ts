import { parseTodo } from '../parser';

describe('Todo.txt Parser - Tags', () => {
    describe('Project Tags', () => {
        const projectTagTests = [
            {
                name: 'single project tag',
                text: 'Task with +project',
                expected: { projects: ['project'], task: 'Task with' }
            },
            {
                name: 'multiple project tags',
                text: 'Task with +project1 +project2 +project3',
                expected: { projects: ['project1', 'project2', 'project3'], task: 'Task with' }
            },
            {
                name: 'project tags at any position',
                text: '+projectStart Task in middle +projectMiddle and end +projectEnd',
                expected: { projects: ['projectStart', 'projectMiddle', 'projectEnd'], task: 'Task in middle and end' }
            },
            {
                name: 'projects with special characters',
                text: 'Task +project-name +project_name +project.name +project123',
                expected: { projects: ['project-name', 'project_name', 'project.name', 'project123'] }
            },
            {
                name: 'projects with Japanese characters',
                text: 'タスク +プロジェクト +日本語プロジェクト',
                expected: { projects: ['プロジェクト', '日本語プロジェクト'] }
            },
            {
                name: 'projects with emojis',
                text: 'Task +🚀rocket +📱mobile +🎯target',
                expected: { projects: ['🚀rocket', '📱mobile', '🎯target'] }
            },
            {
                name: 'case preservation',
                text: 'Task +CamelCase +lowercase +UPPERCASE',
                expected: { projects: ['CamelCase', 'lowercase', 'UPPERCASE'] }
            }
        ];
        
        projectTagTests.forEach(({ name, text, expected }) => {
            it(`should parse ${name}`, () => {
                const todo = parseTodo(text);
                expect(todo.projects()).toEqual(expected.projects);
                if (expected.task) {
                    expect(todo.task()).toBe(expected.task);
                }
            });
        });
    });
    describe('Context Tags', () => {
        const contextTagTests = [
            {
                name: 'single context tag',
                text: 'Task with @context',
                expected: { contexts: ['context'], task: 'Task with' }
            },
            {
                name: 'multiple context tags',
                text: 'Task @home @phone @urgent',
                expected: { contexts: ['home', 'phone', 'urgent'], task: 'Task' }
            },
            {
                name: 'context tags at any position',
                text: '@contextStart Task in middle @contextMiddle and end @contextEnd',
                expected: { contexts: ['contextStart', 'contextMiddle', 'contextEnd'], task: 'Task in middle and end' }
            },
            {
                name: 'contexts with special characters',
                text: 'Task @context-name @context_name @context.name @context123',
                expected: { contexts: ['context-name', 'context_name', 'context.name', 'context123'] }
            },
            {
                name: 'contexts with emojis',
                text: 'Task @🏠home @💼work @🛒shopping',
                expected: { contexts: ['🏠home', '💼work', '🛒shopping'] }
            }
        ];
        
        contextTagTests.forEach(({ name, text, expected }) => {
            it(`should parse ${name}`, () => {
                const todo = parseTodo(text);
                expect(todo.contexts()).toEqual(expected.contexts);
                if (expected.task) {
                    expect(todo.task()).toBe(expected.task);
                }
            });
        });
    });
    describe('Mixed Tags', () => {
        const mixedTagTests = [
            {
                name: 'both projects and contexts',
                text: 'Task +project1 @context1 +project2 @context2',
                expected: { projects: ['project1', 'project2'], contexts: ['context1', 'context2'], task: 'Task' }
            },
            {
                name: 'order preservation',
                text: '+z +a +m @z @a @m',
                expected: { projects: ['z', 'a', 'm'], contexts: ['z', 'a', 'm'] }
            },
            {
                name: 'duplicate tag names',
                text: 'Task +project +project @context @context',
                expected: { projects: ['project', 'project'], contexts: ['context', 'context'] }
            }
        ];
        
        mixedTagTests.forEach(({ name, text, expected }) => {
            it(`should handle ${name}`, () => {
                const todo = parseTodo(text);
                expect(todo.projects()).toEqual(expected.projects);
                expect(todo.contexts()).toEqual(expected.contexts);
                if (expected.task) {
                    expect(todo.task()).toBe(expected.task);
                }
            });
        });
    });
    describe('Non-Tag Cases', () => {
        const nonTagTests = [
            {
                name: 'email addresses',
                text: 'Email user@example.com about project',
                expected: { projects: [], contexts: [], task: 'Email user@example.com about project' }
            },
            {
                name: 'standalone +',
                text: '1 + 1 equals 2',
                expected: { projects: [], contexts: [], task: '1 + 1 equals 2' }
            },
            {
                name: 'standalone @',
                text: 'Meet @ the office',
                expected: { projects: [], contexts: [], task: 'Meet @ the office' }
            },
            {
                name: 'escaped tags',
                text: 'Task with \\+notproject \\@notcontext',
                expected: { projects: [], contexts: [], task: 'Task with \\+notproject \\@notcontext' }
            }
        ];
        
        nonTagTests.forEach(({ name, text, expected }) => {
            it(`should not treat ${name} as tags`, () => {
                const todo = parseTodo(text);
                expect(todo.projects()).toEqual(expected.projects);
                expect(todo.contexts()).toEqual(expected.contexts);
                expect(todo.task()).toBe(expected.task);
            });
        });
    });
    describe('Edge Cases', () => {
        const edgeCaseTests = [
            {
                name: 'tags without task description',
                text: '+project @context',
                expected: { projects: ['project'], contexts: ['context'], task: '' }
            },
            {
                name: 'very long tag names',
                text: `Task +${'a'.repeat(100)} @${'a'.repeat(100)}`,
                expected: { projects: ['a'.repeat(100)], contexts: ['a'.repeat(100)] }
            },
            {
                name: 'tags with URL-like strings',
                text: '+project@email.com might confuse parser',
                expected: { projects: ['project@email.com'], contexts: [] }
            }
        ];
        
        edgeCaseTests.forEach(({ name, text, expected }) => {
            it(`should handle ${name}`, () => {
                const todo = parseTodo(text);
                expect(todo.projects()).toEqual(expected.projects);
                expect(todo.contexts()).toEqual(expected.contexts);
                if (expected.task !== undefined) {
                    expect(todo.task()).toBe(expected.task);
                }
            });
        });
    });
});
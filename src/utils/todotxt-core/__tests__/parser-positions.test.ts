import { parseTodo } from '../parser';
describe('Todo.txt Parser - Element Positions', () => {
    const verifyPosition = (line: string, position: { value: string; start: number; end: number }) => {
        const extracted = line.substring(position.start, position.end);
        expect(extracted).toBe(position.value);
    };
    describe('Basic Element Positions', () => {
        const basicPositionTests = [
            {
                line: 'x Simple completed task',
                element: 'completion',
                expected: { value: 'x', start: 0, end: 1 }
            },
            {
                line: '(A) Priority task',
                element: 'priority',
                expected: { value: '(A)', start: 0, end: 3 }
            },
            {
                line: '2025-01-15 Task with creation date',
                element: 'creationDate',
                expected: { value: '2025-01-15', start: 0, end: 10 }
            }
        ];
        
        basicPositionTests.forEach(({ line, element, expected }) => {
            it(`should provide accurate position for ${element}`, () => {
                const todo = parseTodo(line);
                const positions = todo.getElementPositions();
                expect(positions[element as keyof typeof positions]).toEqual(expected);
                if (positions[element as keyof typeof positions]) {
                    verifyPosition(line, positions[element as keyof typeof positions] as { value: string; start: number; end: number });
                }
            });
        });
    });
    describe('Multiple Element Positions', () => {
        it('provides accurate positions for multiple projects', () => {
            const line = 'Task with +project1 and +project2 tags';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            expect(positions.projects).toHaveLength(2);
            positions.projects.forEach(project => {
                verifyPosition(line, project);
            });
        });
        it('provides accurate positions for multiple contexts', () => {
            const line = 'Task @home @work @urgent';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            expect(positions.contexts).toHaveLength(3);
            positions.contexts.forEach(context => {
                verifyPosition(line, context);
            });
        });
        it('provides accurate positions for key:value pairs', () => {
            const line = 'Task due:2025-12-31 rec:1w note:important';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            expect(positions.keyValues).toHaveLength(3);
            positions.keyValues.forEach(kv => {
                verifyPosition(line, kv);
            });
        });
    });
    describe('Positions with Leading Whitespace', () => {
        const whitespaceTests = [
            {
                line: '    (A) Indented priority task',
                element: 'priority',
                expected: { value: '(A)', start: 4, end: 7 }
            },
            {
                line: '\t\tx Task with tabs',
                element: 'completion',
                expected: { value: 'x', start: 2, end: 3 }
            }
        ];
        
        whitespaceTests.forEach(({ line, element, expected }) => {
            it(`should calculate positions correctly with whitespace for ${element}`, () => {
                const todo = parseTodo(line);
                const positions = todo.getElementPositions();
                expect(positions[element as keyof typeof positions]).toEqual(expected);
                if (positions[element as keyof typeof positions]) {
                    verifyPosition(line, positions[element as keyof typeof positions] as { value: string; start: number; end: number });
                }
            });
        });
    });
    describe('Complex Task Positions', () => {
        it('provides accurate positions for all elements', () => {
            const line = 'x 2025-01-16 (A) 2025-01-15 Complex +project @context due:2025-12-31';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            if (positions.completion) verifyPosition(line, positions.completion);
            if (positions.completionDate) verifyPosition(line, positions.completionDate);
            if (positions.priority) verifyPosition(line, positions.priority);
            if (positions.creationDate) verifyPosition(line, positions.creationDate);
            positions.projects.forEach(p => verifyPosition(line, p));
            positions.contexts.forEach(c => verifyPosition(line, c));
            positions.keyValues.forEach(kv => verifyPosition(line, kv));
        });
        it('ensures positions do not overlap', () => {
            const line = 'Task +proj1 @ctx1 +proj2 @ctx2 due:2025-12-31';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            const allPositions = [
                ...positions.projects,
                ...positions.contexts,
                ...positions.keyValues
            ].sort((a, b) => a.start - b.start);
            for (let i = 0; i < allPositions.length - 1; i++) {
                expect(allPositions[i].end).toBeLessThanOrEqual(allPositions[i + 1].start);
            }
        });
    });
    describe('Positions with Special Characters', () => {
        const specialCharTests = [
            'Task +🚀rocket @🏠home',
            'タスク +プロジェクト @コンテキスト',
            'Task +café @naïve'
        ];
        
        specialCharTests.forEach(line => {
            it(`should calculate positions correctly for "${line}"`, () => {
                const todo = parseTodo(line);
                const positions = todo.getElementPositions();
                positions.projects.forEach(p => verifyPosition(line, p));
                positions.contexts.forEach(c => verifyPosition(line, c));
            });
        });
    });
    describe('Null Position Cases', () => {
        it('returns null for non-existent elements', () => {
            const line = 'Simple task without any special elements';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            expect(positions.completion).toBeNull();
            expect(positions.priority).toBeNull();
            expect(positions.creationDate).toBeNull();
            expect(positions.completionDate).toBeNull();
            expect(positions.projects).toEqual([]);
            expect(positions.contexts).toEqual([]);
            expect(positions.keyValues).toEqual([]);
        });
    });
    describe('Edge Cases', () => {
        const edgeCaseTests = [
            {
                name: 'empty string',
                line: '',
                expectations: {
                    completion: null,
                    projects: []
                }
            },
            {
                name: 'very long line',
                line: 'x ' + 'a'.repeat(1000) + ' +project @context due:2025-12-31',
                expectations: {}
            }
        ];
        
        edgeCaseTests.forEach(({ name, line, expectations }) => {
            it(`should handle ${name}`, () => {
                const todo = parseTodo(line);
                const positions = todo.getElementPositions();
                
                if (expectations.completion !== undefined) {
                    expect(positions.completion).toBe(expectations.completion);
                }
                if (expectations.projects) {
                    expect(positions.projects).toEqual(expectations.projects);
                }
                
                if (positions.completion) verifyPosition(line, positions.completion);
                positions.projects.forEach(p => verifyPosition(line, p));
                positions.contexts.forEach(c => verifyPosition(line, c));
                positions.keyValues.forEach(kv => verifyPosition(line, kv));
            });
        });
    });
});
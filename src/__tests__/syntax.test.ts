import { parseTodo } from '../utils/todotxt-core';

// Syntax highlighting specific tests - focuses on positioning for CSS class application
describe('Syntax highlighting positioning', () => {
    describe('Highlighting position accuracy', () => {
        it('should provide accurate positions for all highlight-able elements', () => {
            const line = '(A) 2025-01-15 Task with +project @context due:2025-12-31';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            
            // Test all elements that syntax.ts highlights
            expect(positions.priority?.value).toBe('(A)');
            expect(positions.creationDate?.value).toBe('2025-01-15');
            expect(positions.projects[0]?.value).toBe('+project');
            expect(positions.contexts[0]?.value).toBe('@context');
            
            // Due date is in keyValues
            const dueDate = positions.keyValues.find(kv => kv.value.startsWith('due:'));
            expect(dueDate?.value).toBe('due:2025-12-31');
        });

        it('should provide positions for completed task elements', () => {
            const line = 'x 2025-01-16 2025-01-15 Completed +project @context due:2025-12-31';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            
            // Elements that get highlighted in completed tasks
            expect(positions.completion?.value).toBe('x');
            expect(positions.completionDate?.value).toBe('2025-01-16');
            expect(positions.creationDate?.value).toBe('2025-01-15');
            expect(positions.projects[0]?.value).toBe('+project');
            expect(positions.contexts[0]?.value).toBe('@context');
        });

        it('should handle edge cases for syntax highlighting', () => {
            // Multiple projects and contexts - common highlighting scenario
            const line = 'Task with +proj1 +proj2 @home @work due:2025-12-31 rec:1w';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            
            expect(positions.projects).toHaveLength(2);
            expect(positions.contexts).toHaveLength(2);
            expect(positions.keyValues).toHaveLength(2);
            
            // Verify positions don't overlap
            const allPositions = [
                ...positions.projects,
                ...positions.contexts,
                ...positions.keyValues
            ].sort((a, b) => a.start - b.start);
            
            for (let i = 0; i < allPositions.length - 1; i++) {
                expect(allPositions[i].end).toBeLessThanOrEqual(allPositions[i + 1].start);
            }
        });

        it('should extract substrings correctly for highlighting verification', () => {
            const line = 'x (B) 2025-01-16 Task +emoji🚀 @café due:2025-12-31';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            
            // Verify all positions extract correct substrings (critical for highlighting)
            [
                positions.completion,
                positions.priority,
                positions.completionDate,
                ...positions.projects,
                ...positions.contexts,
                ...positions.keyValues
            ].filter(Boolean).forEach(pos => {
                if (pos) {
                    const extracted = line.substring(pos.start, pos.end);
                    expect(extracted).toBe(pos.value);
                }
            });
        });
    });

    describe('Syntax highlighting edge cases', () => {
        it('should handle indented tasks', () => {
            const line = '    (A) Indented task +project';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            
            expect(positions.priority?.start).toBe(4);  // After indentation
            expect(positions.projects[0]?.start).toBeGreaterThan(20);
        });

        it('should handle emoji in tags (Unicode highlighting)', () => {
            const line = 'Task +🚀rocket @🏠home';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            
            expect(positions.projects[0]?.value).toBe('+🚀rocket');
            expect(positions.contexts[0]?.value).toBe('@🏠home');
            
            // Verify Unicode is handled correctly
            const projectExtracted = line.substring(
                positions.projects[0].start, 
                positions.projects[0].end
            );
            expect(projectExtracted).toBe('+🚀rocket');
        });
    });
});
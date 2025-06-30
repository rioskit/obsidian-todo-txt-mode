import { shouldAddCompletionDate, addCompletionDate } from '../completion-date';

describe('CompletionDateService', () => {
    const expectDatePattern = (text: string, pattern: string) => {
        expect(text).toMatch(new RegExp(pattern));
    };
    describe('shouldAddCompletionDate', () => {
        it('should return true when current line has no completion date', () => {
            const currentLine = 'x Task without completion date';
            const previousLine = 'Task without completion date';
            const result = shouldAddCompletionDate(currentLine, previousLine);
            expect(result).toBe(true);
        });
        it('should return true when current completion date matches previous creation date', () => {
            const currentLine = 'x 2023-12-20 Task with creation date';
            const previousLine = '2023-12-20 Task with creation date';
            const result = shouldAddCompletionDate(currentLine, previousLine);
            expect(result).toBe(true);
        });
        it('should return true when current completion date was originally creation date', () => {
            const currentLine = 'x 2025-07-02 Task with creation date';
            const previousLine = '2025-07-02 Task with creation date';
            const result = shouldAddCompletionDate(currentLine, previousLine);
            expect(result).toBe(true);
        });
        it('should return false when current line has proper completion date', () => {
            const currentLine = 'x 2025-07-04 2025-07-02 Task with both dates';
            const previousLine = '2025-07-02 Task with both dates';
            const result = shouldAddCompletionDate(currentLine, previousLine);
            expect(result).toBe(false);
        });
        it('should return true when current line has no completion date and previous line has no creation date', () => {
            const currentLine = 'x Simple task';
            const previousLine = 'Simple task';
            const result = shouldAddCompletionDate(currentLine, previousLine);
            expect(result).toBe(true);
        });
        it('should handle priority tasks correctly', () => {
            const currentLine = 'x (A) Priority task';
            const previousLine = '(A) Priority task';
            const result = shouldAddCompletionDate(currentLine, previousLine);
            expect(result).toBe(true);
        });
    });
    describe('addCompletionDate', () => {
        it('should add completion date to simple completed task', () => {
            const lineText = 'x Simple task';
            const result = addCompletionDate(lineText);
            expectDatePattern(result, '^x \\d{4}-\\d{2}-\\d{2} Simple task$');
        });
        it('should add completion date to completed task with priority', () => {
            const lineText = 'x (A) Priority task';
            const result = addCompletionDate(lineText);
            expectDatePattern(result, '^x \\(A\\) \\d{4}-\\d{2}-\\d{2} Priority task$');
        });
        it('should preserve indentation', () => {
            const lineText = '    x Indented task';
            const result = addCompletionDate(lineText);
            expectDatePattern(result, '^ {4}x \\d{4}-\\d{2}-\\d{2} Indented task$');
        });
        it('should handle tab indentation', () => {
            const lineText = '\t\tx Task with tabs';
            const result = addCompletionDate(lineText);
            expectDatePattern(result, '^\\t\\tx \\d{4}-\\d{2}-\\d{2} Task with tabs$');
        });
        it('should return unchanged text if not a completed task', () => {
            const lineText = 'Not completed task';
            const result = addCompletionDate(lineText);
            expect(result).toBe('Not completed task');
        });
        it('should handle priority with spaces correctly', () => {
            const lineText = 'x (B) Task with priority B';
            const result = addCompletionDate(lineText);
            expectDatePattern(result, '^x \\(B\\) \\d{4}-\\d{2}-\\d{2} Task with priority B$');
        });
    });
});
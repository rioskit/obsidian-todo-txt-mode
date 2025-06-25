import { parsePriorityValue, parseProjectTag, parseContextTag, parseDueDate } from '../parser';

describe('TodoTxtSorter - 実装関数のテスト', () => {
    describe('parsePriorityValue', () => {
        it('完了タスクは最大値を返す', () => {
            expect(parsePriorityValue('x Completed task')).toBe(Number.MAX_SAFE_INTEGER);
            expect(parsePriorityValue('  x Completed task with spaces')).toBe(Number.MAX_SAFE_INTEGER);
        });

        it('優先度なしは最大値-1を返す', () => {
            expect(parsePriorityValue('Task without priority')).toBe(Number.MAX_SAFE_INTEGER - 1);
        });

        it('アルファベット優先度の処理', () => {
            expect(parsePriorityValue('(A) High priority')).toBe(0);
            expect(parsePriorityValue('(B) Medium priority')).toBe(1);
            expect(parsePriorityValue('(C) Low priority')).toBe(2);
            expect(parsePriorityValue('(Z) Lowest priority')).toBe(25);
        });

        it('数値優先度の処理', () => {
            expect(parsePriorityValue('(1) First task')).toBe(1);
            expect(parsePriorityValue('(10) Tenth task')).toBe(10);
            expect(parsePriorityValue('(123) Task 123')).toBe(123);
        });

        it('混合優先度の処理', () => {
            expect(parsePriorityValue('(1a) Mixed priority')).toBe(1);
            expect(parsePriorityValue('(10b) Another mixed')).toBe(10);
            expect(parsePriorityValue('(A1) Letter first')).toBe(0);
        });
    });

    describe('parseProjectTag', () => {
        it('プロジェクトタグを抽出', () => {
            expect(parseProjectTag('Task +project1')).toBe('project1');
            expect(parseProjectTag('Task +Project2 with more text')).toBe('project2');
            expect(parseProjectTag('+ProjectAtStart')).toBe('projectatstart');
        });

        it('プロジェクトタグがない場合のデフォルト値', () => {
            expect(parseProjectTag('Task without project')).toBe('zzzz');
        });

        it('複数のプロジェクトタグがある場合は最初のものを返す', () => {
            expect(parseProjectTag('Task +first +second')).toBe('first');
        });
    });

    describe('parseContextTag', () => {
        it('コンテキストタグを抽出', () => {
            expect(parseContextTag('Task @home')).toBe('home');
            expect(parseContextTag('Task @Work with more text')).toBe('work');
            expect(parseContextTag('@ContextAtStart')).toBe('contextatstart');
        });

        it('コンテキストタグがない場合のデフォルト値', () => {
            expect(parseContextTag('Task without context')).toBe('zzzz');
        });

        it('複数のコンテキストタグがある場合は最初のものを返す', () => {
            expect(parseContextTag('Task @first @second')).toBe('first');
        });
    });

    describe('parseDueDate', () => {
        it('期日を抽出', () => {
            expect(parseDueDate('Task due:2023-12-31')).toBe('2023-12-31');
            expect(parseDueDate('due:2024-01-01 Task with date')).toBe('2024-01-01');
        });

        it('期日なしの場合のデフォルト値（未来）', () => {
            expect(parseDueDate('Task without due date')).toBe('9999-99-99');
        });

        it('期日なしの場合のデフォルト値（過去）', () => {
            expect(parseDueDate('Task without due date', false)).toBe('0000-00-00');
        });
    });
});
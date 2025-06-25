import { projectRegex, contextRegex, priorityRegex, dueDateRegex } from '../syntax';

describe('Todo.txt Syntax - 実装正規表現のテスト', () => {
    describe('projectRegex', () => {
        beforeEach(() => {
            // グローバル正規表現のlastIndexをリセット
            projectRegex.lastIndex = 0;
        });

        it('プロジェクトタグを正しくマッチ', () => {
            expect('+project'.match(projectRegex)).toEqual(['+project']);
            projectRegex.lastIndex = 0;
            expect('Task +project1 +project2'.match(projectRegex)).toEqual(['+project1', '+project2']);
            projectRegex.lastIndex = 0;
            expect('+ProjectAtStart and +ProjectAtEnd'.match(projectRegex)).toEqual(['+ProjectAtStart', '+ProjectAtEnd']);
        });

        it('プロジェクトタグがない場合はnull', () => {
            expect('No project here'.match(projectRegex)).toBeNull();
            projectRegex.lastIndex = 0;
            expect('+ space after plus'.match(projectRegex)).toBeNull();
        });

        it('特殊文字を含むプロジェクトタグ', () => {
            expect('Task +project-name'.match(projectRegex)).toEqual(['+project-name']);
            projectRegex.lastIndex = 0;
            expect('Task +project_name'.match(projectRegex)).toEqual(['+project_name']);
            projectRegex.lastIndex = 0;
            expect('Task +project123'.match(projectRegex)).toEqual(['+project123']);
        });
    });

    describe('contextRegex', () => {
        beforeEach(() => {
            contextRegex.lastIndex = 0;
        });

        it('コンテキストタグを正しくマッチ', () => {
            expect('@home'.match(contextRegex)).toEqual(['@home']);
            contextRegex.lastIndex = 0;
            expect('Task @context1 @context2'.match(contextRegex)).toEqual(['@context1', '@context2']);
            contextRegex.lastIndex = 0;
            expect('@ContextAtStart and @ContextAtEnd'.match(contextRegex)).toEqual(['@ContextAtStart', '@ContextAtEnd']);
        });

        it('コンテキストタグがない場合はnull', () => {
            expect('No context here'.match(contextRegex)).toBeNull();
            contextRegex.lastIndex = 0;
            expect('@ space after at'.match(contextRegex)).toBeNull();
        });

        it('特殊文字を含むコンテキストタグ', () => {
            expect('Task @context-name'.match(contextRegex)).toEqual(['@context-name']);
            contextRegex.lastIndex = 0;
            expect('Task @context_name'.match(contextRegex)).toEqual(['@context_name']);
            contextRegex.lastIndex = 0;
            expect('Task @context123'.match(contextRegex)).toEqual(['@context123']);
        });
    });

    describe('priorityRegex', () => {
        it('アルファベット優先度をマッチ', () => {
            expect('(A) Task'.match(priorityRegex)).toBeTruthy();
            expect('(B) Task'.match(priorityRegex)).toBeTruthy();
            expect('(Z) Task'.match(priorityRegex)).toBeTruthy();
        });

        it('数値優先度をマッチ', () => {
            expect('(1) Task'.match(priorityRegex)).toBeTruthy();
            expect('(10) Task'.match(priorityRegex)).toBeTruthy();
            expect('(123) Task'.match(priorityRegex)).toBeTruthy();
        });

        it('混合優先度をマッチ', () => {
            expect('(A1) Task'.match(priorityRegex)).toBeTruthy();
            expect('(1a) Task'.match(priorityRegex)).toBeTruthy();
            expect('(A1b2) Task'.match(priorityRegex)).toBeTruthy();
        });

        it('スペースありでもマッチ', () => {
            expect('  (A) Task with spaces'.match(priorityRegex)).toBeTruthy();
            expect(' (B) Another task'.match(priorityRegex)).toBeTruthy();
        });

        it('完了タスクでもマッチ', () => {
            expect('x (A) Completed task'.match(priorityRegex)).toBeTruthy();
            expect('  x  (B) Completed with spaces'.match(priorityRegex)).toBeTruthy();
        });

        it('無効な優先度はマッチしない', () => {
            expect('(a) Lower case'.match(priorityRegex)).toBeNull();
            expect('No priority here'.match(priorityRegex)).toBeNull();
            expect('Middle (A) priority'.match(priorityRegex)).toBeNull();
        });
    });

    describe('dueDateRegex', () => {
        beforeEach(() => {
            dueDateRegex.lastIndex = 0;
        });

        it('標準的な期日フォーマットをマッチ', () => {
            expect('due:2024-12-31'.match(dueDateRegex)).toEqual(['due:2024-12-31']);
            dueDateRegex.lastIndex = 0;
            expect('Task due:2024-01-01 text'.match(dueDateRegex)).toEqual(['due:2024-01-01']);
        });

        it('様々な期日フォーマットをマッチ', () => {
            expect('due:tomorrow'.match(dueDateRegex)).toEqual(['due:tomorrow']);
            dueDateRegex.lastIndex = 0;
            expect('due:today'.match(dueDateRegex)).toEqual(['due:today']);
            dueDateRegex.lastIndex = 0;
            expect('due:2024/12/31'.match(dueDateRegex)).toEqual(['due:2024/12/31']);
        });

        it('複数の期日をマッチ', () => {
            expect('Task due:2024-01-01 and due:2024-12-31'.match(dueDateRegex))
                .toEqual(['due:2024-01-01', 'due:2024-12-31']);
        });

        it('期日がない場合はnull', () => {
            expect('No due date here'.match(dueDateRegex)).toBeNull();
            dueDateRegex.lastIndex = 0;
            expect('due: space after colon'.match(dueDateRegex)).toBeNull();
        });
    });

    describe('完了タスク判定', () => {
        it('完了タスクを正しく判定', () => {
            expect('x Completed task'.trim().startsWith('x ')).toBe(true);
            expect('x 2024-01-01 Completed task with date'.trim().startsWith('x ')).toBe(true);
        });

        it('未完了タスクは判定しない', () => {
            expect('Active task'.trim().startsWith('x ')).toBe(false);
            expect('(A) Priority task'.trim().startsWith('x ')).toBe(false);
            expect('Task with x in middle'.trim().startsWith('x ')).toBe(false);
        });
    });
});
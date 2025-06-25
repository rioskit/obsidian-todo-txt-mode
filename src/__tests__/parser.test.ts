import { tokenizeLine, Token, ParsedLine } from '../parser';

describe('tokenizeLine', () => {
    describe('テキストトークン', () => {
        it('テキストのみ', () => {
            const result = tokenizeLine('これはシンプルなタスクです');
            expect(result.tokens).toHaveLength(1);
            expect(result.tokens[0]).toEqual({
                type: 'text',
                value: 'これはシンプルなタスクです',
                start: 0,
                end: 13
            });
        });

        it('空行', () => {
            const result = tokenizeLine('');
            expect(result.tokens).toHaveLength(0);
        });

        it('空白のみ', () => {
            const result = tokenizeLine('   ');
            expect(result.tokens).toHaveLength(0);
        });
    });

    describe('完了フラグ', () => {
        it('完了フラグのみ', () => {
            const result = tokenizeLine('x');
            expect(result.tokens).toHaveLength(1);
            expect(result.tokens[0]).toEqual({
                type: 'completion',
                value: 'x',
                start: 0,
                end: 1
            });
        });

        it('完了フラグ付き', () => {
            const result = tokenizeLine('x 完了したタスク');
            expect(result.tokens).toHaveLength(2);
            expect(result.tokens[0]).toEqual({
                type: 'completion',
                value: 'x',
                start: 0,
                end: 1
            });
            expect(result.tokens[1].type).toBe('text');
            expect(result.tokens[1].value).toBe('完了したタスク');
            expect(result.tokens[1].start).toBe(2);
        });

        it('インデント付き', () => {
            const result = tokenizeLine('  x 完了したタスク');
            expect(result.tokens).toHaveLength(2);
            expect(result.tokens[0]).toEqual({
                type: 'completion',
                value: 'x',
                start: 2,
                end: 3
            });
        });
    });

    describe('優先度', () => {
        it('アルファベット', () => {
            const result = tokenizeLine('(A) 高優先度タスク');
            expect(result.tokens).toHaveLength(2);
            expect(result.tokens[0]).toEqual({
                type: 'priority',
                value: '(A)',
                start: 0,
                end: 3
            });
            expect(result.tokens[1].type).toBe('text');
            expect(result.tokens[1].value).toBe('高優先度タスク');
            expect(result.tokens[1].start).toBe(4);
        });

        it('数字', () => {
            const result = tokenizeLine('(1) 数字優先度タスク');
            expect(result.tokens).toHaveLength(2);
            expect(result.tokens[0]).toEqual({
                type: 'priority',
                value: '(1)',
                start: 0,
                end: 3
            });
        });

        it('混合', () => {
            const result = tokenizeLine('(A1) 混合優先度タスク');
            expect(result.tokens).toHaveLength(2);
            expect(result.tokens[0]).toEqual({
                type: 'priority',
                value: '(A1)',
                start: 0,
                end: 4
            });
        });

        it('完了フラグ付き', () => {
            const result = tokenizeLine('x (A) 完了した高優先度タスク');
            expect(result.tokens).toHaveLength(3);
            expect(result.tokens[0].type).toBe('completion');
            expect(result.tokens[1]).toEqual({
                type: 'priority',
                value: '(A)',
                start: 2,
                end: 5
            });
            expect(result.tokens[2].type).toBe('text');
        });
    });

    describe('日付', () => {
        it('完了日', () => {
            const result = tokenizeLine('x 2024-01-15 完了したタスク');
            expect(result.tokens).toHaveLength(3);
            expect(result.tokens[0].type).toBe('completion');
            expect(result.tokens[1]).toEqual({
                type: 'completion_date',
                value: '2024-01-15',
                start: 2,
                end: 12
            });
        });

        it('作成日', () => {
            const result = tokenizeLine('2024-01-15 作成日付きタスク');
            expect(result.tokens).toHaveLength(2);
            expect(result.tokens[0]).toEqual({
                type: 'creation_date',
                value: '2024-01-15',
                start: 0,
                end: 10
            });
        });

        it('完了日と作成日', () => {
            const result = tokenizeLine('x 2024-01-15 2024-01-10 完了タスク');
            expect(result.tokens).toHaveLength(4);
            expect(result.tokens[0].type).toBe('completion');
            expect(result.tokens[1]).toEqual({
                type: 'completion_date',
                value: '2024-01-15',
                start: 2,
                end: 12
            });
            expect(result.tokens[2]).toEqual({
                type: 'creation_date',
                value: '2024-01-10',
                start: 13,
                end: 23
            });
        });

        it('優先度付き', () => {
            const result = tokenizeLine('(A) 2024-01-15 優先度付きタスク');
            expect(result.tokens).toHaveLength(3);
            expect(result.tokens[0].type).toBe('priority');
            expect(result.tokens[1]).toEqual({
                type: 'creation_date',
                value: '2024-01-15',
                start: 4,
                end: 14
            });
        });

        it('完全な構文', () => {
            const result = tokenizeLine('x (A) 2024-01-15 2024-01-10 完了タスク');
            expect(result.tokens).toHaveLength(5);
            expect(result.tokens[0].type).toBe('completion');
            expect(result.tokens[1].type).toBe('priority');
            expect(result.tokens[2].type).toBe('completion_date');
            expect(result.tokens[3].type).toBe('creation_date');
            expect(result.tokens[4].type).toBe('text');
        });
    });

    describe('プロジェクトとコンテキスト', () => {
        it('プロジェクト', () => {
            const result = tokenizeLine('タスク +project1 +project2');
            expect(result.tokens).toHaveLength(3);
            expect(result.tokens[1].type).toBe('project');
            expect(result.tokens[1].value).toBe('+project1');
            expect(result.tokens[2].type).toBe('project');
            expect(result.tokens[2].value).toBe('+project2');
        });

        it('コンテキスト', () => {
            const result = tokenizeLine('タスク @home @work');
            expect(result.tokens).toHaveLength(3);
            expect(result.tokens[1].type).toBe('context');
            expect(result.tokens[1].value).toBe('@home');
            expect(result.tokens[2].type).toBe('context');
            expect(result.tokens[2].value).toBe('@work');
        });

        it('混合', () => {
            const result = tokenizeLine('タスク +project @context');
            expect(result.tokens).toHaveLength(3);
            expect(result.tokens[1].type).toBe('project');
            expect(result.tokens[2].type).toBe('context');
        });
    });

    describe('key:value', () => {
        it('due:日付', () => {
            const result = tokenizeLine('タスク due:2024-01-15');
            expect(result.tokens).toHaveLength(2);
            expect(result.tokens[1].type).toBe('key_value');
            expect(result.tokens[1].value).toBe('due:2024-01-15');
        });

        it('カスタム', () => {
            const result = tokenizeLine('タスク priority:high effort:low');
            expect(result.tokens).toHaveLength(3);
            expect(result.tokens[1].type).toBe('key_value');
            expect(result.tokens[1].value).toBe('priority:high');
            expect(result.tokens[2].type).toBe('key_value');
            expect(result.tokens[2].value).toBe('effort:low');
        });
    });

    describe('複合構文', () => {
        it('未完了タスク', () => {
            const result = tokenizeLine('(A) Call Mom +Family +PeaceLake due:2016-02-02');
            const tokenTypes = result.tokens.map(t => t.type);
            expect(tokenTypes).toContain('priority');
            expect(tokenTypes).toContain('text');
            expect(tokenTypes).toContain('project');
            expect(tokenTypes).toContain('key_value');
            
            const projectTokens = result.tokens.filter(t => t.type === 'project');
            expect(projectTokens).toHaveLength(2);
            expect(projectTokens[0].value).toBe('+Family');
            expect(projectTokens[1].value).toBe('+PeaceLake');
        });

        it('完了タスク', () => {
            const result = tokenizeLine('x 2011-03-02 2011-03-01 Review Tim\'s pull request +TodoTxtTouch @github due:2016-05-30');
            const tokenTypes = result.tokens.map(t => t.type);
            expect(tokenTypes).toContain('completion');
            expect(tokenTypes).toContain('completion_date');
            expect(tokenTypes).toContain('creation_date');
            expect(tokenTypes).toContain('project');
            expect(tokenTypes).toContain('context');
            expect(tokenTypes).toContain('key_value');
            
            expect(result.tokens[0].type).toBe('completion');
            expect(result.tokens[1].type).toBe('completion_date');
            expect(result.tokens[2].type).toBe('creation_date');
        });

        it('完全な構文', () => {
            const result = tokenizeLine('x (A) 2016-05-20 2016-04-30 measure space for +chapelShelving @chapel due:2016-05-30');
            expect(result.tokens.length).toBeGreaterThan(8);
            const tokenTypes = result.tokens.map(t => t.type);
            
            expect(result.tokens[0].type).toBe('completion');
            expect(result.tokens[1].type).toBe('priority');
            expect(result.tokens[2].type).toBe('completion_date');
            expect(result.tokens[3].type).toBe('creation_date');
            
            expect(tokenTypes).toContain('project');
            expect(tokenTypes).toContain('context');
            expect(tokenTypes).toContain('key_value');
        });

        it('日本語タスク', () => {
            const result = tokenizeLine('x (A) 2024-01-15 2024-01-10 買い物リストを作成 +家事 @買い物 due:2024-01-20');
            expect(result.tokens.length).toBeGreaterThan(7);
            
            expect(result.tokens[0].type).toBe('completion');
            expect(result.tokens[1].type).toBe('priority');
            expect(result.tokens[2].type).toBe('completion_date');
            expect(result.tokens[3].type).toBe('creation_date');
            
            const tokenTypes = result.tokens.map(t => t.type);
            expect(tokenTypes).toContain('project');
            expect(tokenTypes).toContain('context');
            expect(tokenTypes).toContain('key_value');
        });
    });

    describe('エッジケース', () => {
        it('無効な優先度', () => {
            const result = tokenizeLine('(a) 小文字優先度');
            expect(result.tokens[0].type).toBe('text');
        });

        it('空白なし', () => {
            const result = tokenizeLine('タスク+project@context');
            expect(result.tokens).toHaveLength(1);
            expect(result.tokens[0].type).toBe('text');
        });

        it('不完全なkey:value', () => {
            const result = tokenizeLine('タスク key: value');
            expect(result.tokens.some(t => t.type === 'key_value')).toBe(false);
        });

        it('未完了タスクで2つの日付（連続）', () => {
            const result = tokenizeLine('2011-03-02 2011-03-01 Review Tim\'s pull request +TodoTxtTouch @github due:2016-05-30');
            console.log('Debug - Tokens:', result.tokens.map(t => `${t.type}:${t.value}`));
            
            // 最初の日付は creation_date として認識されるべき
            expect(result.tokens[0].type).toBe('creation_date');
            expect(result.tokens[0].value).toBe('2011-03-02');
            
            // 2番目の日付はtextとして扱われるべき（未完了タスクでは完了日は存在しない）
            expect(result.tokens[1].type).toBe('text');
            expect(result.tokens[1].value).toBe('2011-03-01');
        });

        it('未完了タスクで優先度付き2つの日付', () => {
            const result = tokenizeLine('(A) 2011-03-02 2011-03-01 Review Tim\'s pull request +TodoTxtTouch @github due:2016-05-30');
            console.log('Debug - Tokens:', result.tokens.map(t => `${t.type}:${t.value}`));
            
            expect(result.tokens[0].type).toBe('priority');
            expect(result.tokens[0].value).toBe('(A)');
            
            // 優先度の後の最初の日付は creation_date として認識されるべき
            expect(result.tokens[1].type).toBe('creation_date');
            expect(result.tokens[1].value).toBe('2011-03-02');
            
            // 2番目の日付はtextとして扱われるべき
            expect(result.tokens[2].type).toBe('text');
            expect(result.tokens[2].value).toBe('2011-03-01');
        });

        it('完了タスクで優先度記号が含まれる場合', () => {
            const result = tokenizeLine('x (A) 2025-01-02 hoge @hoge');
            console.log('Debug - Completed with priority tokens:', result.tokens.map(t => `${t.type}:${t.value}`));
            
            expect(result.tokens[0].type).toBe('completion');
            expect(result.tokens[0].value).toBe('x');
            
            // 完了タスクでも優先度はパースされる
            expect(result.tokens[1].type).toBe('priority');
            expect(result.tokens[1].value).toBe('(A)');
            
            // 最初の日付は completion_date として認識されるべき
            expect(result.tokens[2].type).toBe('completion_date');
            expect(result.tokens[2].value).toBe('2025-01-02');
        });
    });
});
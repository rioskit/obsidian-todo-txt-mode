import { tokenizeLine } from '../parser';
import { createTodoTxtExtension } from '../syntax';

describe('tokenizeLine', () => {
    describe('基本構文テスト（Basic Syntax Tests）', () => {
        it('シンプルなタスク（パラメータなし）', () => {
            const testCases = [
                'Simple task without any parameters',
                'Simple task',
                'Task',
                'A'
            ];
            
            testCases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens.every(t => t.type === 'text')).toBe(true);
                expect(result.tokens.map(t => t.value).join(' ')).toBe(line);
            });
        });

        describe('優先度パターン', () => {
            it('大文字優先度 (A)-(Z)', () => {
                const priorities = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                                   'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
                
                priorities.forEach(letter => {
                    const line = `(${letter}) Task with priority ${letter}`;
                    const result = tokenizeLine(line);
                    
                    expect(result.tokens[0].type).toBe('priority');
                    expect(result.tokens[0].value).toBe(`(${letter})`);
                });
            });

            it('数値優先度', () => {
                const numericPriorities = [
                    '(0) Zero priority task',
                    '(1) Single digit priority task',
                    '(7) Single digit priority task',
                    '(123) Numeric priority task',
                    '(999) Three digit priority task',
                    '(999999) Very large numeric priority'
                ];
                
                numericPriorities.forEach(line => {
                    const result = tokenizeLine(line);
                    expect(result.tokens[0].type).toBe('priority');
                });
            });

            it('無効な優先度形式', () => {
                const invalidPriorities = [
                    '(1a) Mixed alphanumeric priority task',
                    '(A1) Letter first mixed priority task',
                    '(ABC) Multi-letter priority task',
                    '(A1B2C3) Complex alphanumeric priority',
                    '(123456789) Very long numeric priority'
                ];
                
                invalidPriorities.forEach(line => {
                    const result = tokenizeLine(line);
                    expect(result.tokens[0].type).toBe('priority');
                });
            });

            it('優先度のみ（説明なし）', () => {
                const line = '(A) Priority only no task description';
                const result = tokenizeLine(line);
                
                expect(result.tokens[0].type).toBe('priority');
                expect(result.tokens[0].value).toBe('(A)');
                expect(result.tokens.slice(1).every(t => t.type === 'text')).toBe(true);
            });
        });

        describe('日付パターン', () => {
            it('作成日のみ', () => {
                const dateCases = [
                    '2025-01-15 Task with creation date only',
                    '2024-12-31 Last day of year task',
                    '2023-01-01 First day of year task',
                    '2025-01-15 Date only no description'
                ];
                
                dateCases.forEach(line => {
                    const result = tokenizeLine(line);
                    expect(result.tokens[0].type).toBe('creation_date');
                    expect(result.tokens[0].value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
                });
            });

            it('複数の日付（最初のみ認識）', () => {
                const line = 'Multiple dates 2025-01-15 2025-01-16 2025-01-17 in task';
                const result = tokenizeLine(line);
                
                // パーサーは日付形式の文字列をすべてテキストとして扱う（前にテキストがある場合）
                const dateTokens = result.tokens.filter(t => 
                    t.value === '2025-01-15' || t.value === '2025-01-16' || t.value === '2025-01-17'
                );
                dateTokens.forEach(token => {
                    expect(token.type).toBe('text');
                });
            });
        });

        describe('基本タグ', () => {
            it('単一プロジェクトタグ', () => {
                const projectCases = [
                    'Task with +project',
                    'Task with +MultiWordProject',
                    '+project Task starting with project tag',
                    'Task with +CamelCaseProject',
                    'Task with +snake_case_project'
                ];
                
                projectCases.forEach(line => {
                    const result = tokenizeLine(line);
                    const projectTokens = result.tokens.filter(t => t.type === 'project');
                    expect(projectTokens.length).toBeGreaterThan(0);
                    projectTokens.forEach(token => {
                        expect(token.value).toMatch(/^\+\w+/);
                    });
                });
            });

            it('単一コンテキストタグ', () => {
                const contextCases = [
                    'Task with @context',
                    'Task with @MultiWordContext',
                    '@context Task starting with context tag',
                    'Task with @PascalCaseContext',
                    'Task with @kebab-case-context'
                ];
                
                contextCases.forEach(line => {
                    const result = tokenizeLine(line);
                    const contextTokens = result.tokens.filter(t => t.type === 'context');
                    expect(contextTokens.length).toBeGreaterThan(0);
                    contextTokens.forEach(token => {
                        expect(token.value).toMatch(/^@\w+/);
                    });
                });
            });

            it('key:value ペア', () => {
                const keyValueCases = [
                    'Task with key:value pair due:2025-12-31',
                    'Task with time due:2025-12-31T14:30:00',
                    'rec:+1w Recurrence with plus sign',
                    'Custom key custom:value in task',
                    't:2025-01-15 Short key for date',
                    'p:1 Short key for priority'
                ];
                
                keyValueCases.forEach(line => {
                    const result = tokenizeLine(line);
                    const keyValueTokens = result.tokens.filter(t => t.type === 'key_value');
                    expect(keyValueTokens.length).toBeGreaterThan(0);
                    keyValueTokens.forEach(token => {
                        expect(token.value).toContain(':');
                    });
                });
            });

            it('パラメータのみ（説明なし）', () => {
                const paramOnlyCases = [
                    '+project Task with only project no description after',
                    '@context Task with only context no description after',
                    'due:2025-12-31 Task with only key:value no description after'
                ];
                
                paramOnlyCases.forEach(line => {
                    const result = tokenizeLine(line);
                    const firstToken = result.tokens[0];
                    expect(['project', 'context', 'key_value']).toContain(firstToken.type);
                });
            });
        });
    });

    describe('完了タスクテスト（Completed Task Tests）', () => {
        it('基本的な完了タスク', () => {
            const completedCases = [
                'x Simple completed task',
                'x Completed marker only no description',
                'x'
            ];
            
            completedCases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens[0].type).toBe('completion');
                expect(result.tokens[0].value).toBe('x');
            });
        });

        it('完了日付付き', () => {
            const cases = [
                'x 2025-01-16 Completed task with completion date',
                'x 2025-01-16 Completed with date only no description',
                'x  2025-01-16 Completed with double space'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens[0].type).toBe('completion');
                expect(result.tokens[1].type).toBe('completion_date');
                expect(result.tokens[1].value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            });
        });

        it('完了日付＋作成日付', () => {
            const cases = [
                'x 2025-01-16 2025-01-15 Completed task with completion and creation dates',
                'x 2025-01-16  2025-01-15 Double space between dates',
                'x 2011-03-02 2011-03-01 Review Tim\'s pull request'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens[0].type).toBe('completion');
                expect(result.tokens[1].type).toBe('completion_date');
                expect(result.tokens[2].type).toBe('creation_date');
            });
        });

        it('完了タスクとプロジェクトタグ', () => {
            const cases = [
                'x 2025-01-16 Completed task with +project',
                'x 2025-01-16 2025-01-15 Completed with dates and +project',
                'x Completed with +project1 +project2'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens[0].type).toBe('completion');
                const projectTokens = result.tokens.filter(t => t.type === 'project');
                expect(projectTokens.length).toBeGreaterThan(0);
            });
        });

        it('完了タスクとコンテキストタグ', () => {
            const cases = [
                'x 2025-01-16 Completed task with @context',
                'x 2025-01-16 2025-01-15 Completed with dates and @context',
                'x Completed with @home @work'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens[0].type).toBe('completion');
                const contextTokens = result.tokens.filter(t => t.type === 'context');
                expect(contextTokens.length).toBeGreaterThan(0);
            });
        });

        it('完了タスクとkey:value', () => {
            const cases = [
                'x 2025-01-16 Completed task with due:2025-12-31',
                'x 2025-01-16 2025-01-15 Completed with dates and due:2025-12-31',
                'x Completed with due:2025-12-31 done:2025-01-16'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens[0].type).toBe('completion');
                const keyValueTokens = result.tokens.filter(t => t.type === 'key_value');
                expect(keyValueTokens.length).toBeGreaterThan(0);
            });
        });

        it('完了タスクと複数パラメータ', () => {
            const cases = [
                'x 2025-01-16 Completed with +project @context',
                'x 2025-01-16 Completed with +project due:2025-12-31',
                'x 2025-01-16 Completed with @context due:2025-12-31',
                'x 2025-01-16 Completed with +project @context due:2025-12-31',
                'x 2025-01-16 2025-01-15 Completed all params +project @context due:2025-12-31'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens[0].type).toBe('completion');
                
                const hasProject = result.tokens.some(t => t.type === 'project');
                const hasContext = result.tokens.some(t => t.type === 'context');
                const hasKeyValue = result.tokens.some(t => t.type === 'key_value');
                
                expect(hasProject || hasContext || hasKeyValue).toBe(true);
            });
        });

        it('優先度付き完了タスク（x が優先）', () => {
            const line = 'x (B) 2025-01-16 2025-01-15 Complete +🚀 +📱 @🏠 @💼 due:2025-12-31 done:2025-01-16';
            const result = tokenizeLine(line);
            
            expect(result.tokens[0].type).toBe('completion');
            expect(result.tokens[1].type).toBe('priority');
            expect(result.tokens[2].type).toBe('completion_date');
            expect(result.tokens[3].type).toBe('creation_date');
        });
    });

    describe('組み合わせパターンテスト（Combination Pattern Tests）', () => {
        describe('優先度と日付の組み合わせ', () => {
            it('優先度＋作成日', () => {
                const cases = [
                    '(A) 2025-01-15 Priority A with creation date',
                    '(B) 2025-01-15 Priority B with creation date',
                    '(123) 2025-01-15 Numeric priority with creation date',
                    '(A) 2025-01-15 No space after priority works as valid format'
                ];
                
                cases.forEach(line => {
                    const result = tokenizeLine(line);
                    expect(result.tokens[0].type).toBe('priority');
                    expect(result.tokens[1].type).toBe('creation_date');
                });
            });

            it('優先度＋日付＋スペースバリエーション', () => {
                const line = '(A)  2025-01-15 Double space after priority';
                const result = tokenizeLine(line);
                
                expect(result.tokens[0].type).toBe('priority');
                expect(result.tokens[1].type).toBe('creation_date');
            });
        });

        describe('優先度とタグの組み合わせ', () => {
            it('優先度＋プロジェクト', () => {
                const cases = [
                    '(A) Task with priority and +project',
                    '(123456789) Very long numeric priority +project',
                    '(A1B2C3) Complex alphanumeric priority @context'
                ];
                
                cases.forEach(line => {
                    const result = tokenizeLine(line);
                    expect(result.tokens[0].type).toBe('priority');
                    const hasProjectOrContext = result.tokens.some(t => t.type === 'project' || t.type === 'context');
                    expect(hasProjectOrContext).toBe(true);
                });
            });

            it('優先度＋コンテキスト', () => {
                const line = '(A) Task with priority and @context';
                const result = tokenizeLine(line);
                
                expect(result.tokens[0].type).toBe('priority');
                expect(result.tokens.some(t => t.type === 'context')).toBe(true);
            });

            it('優先度＋key:value', () => {
                const line = '(A) Task with priority and due:2025-12-31';
                const result = tokenizeLine(line);
                
                expect(result.tokens[0].type).toBe('priority');
                expect(result.tokens.some(t => t.type === 'key_value')).toBe(true);
            });
        });

        describe('日付とタグの組み合わせ', () => {
            it('作成日＋プロジェクト', () => {
                const line = '2025-01-15 Creation date with +project';
                const result = tokenizeLine(line);
                
                expect(result.tokens[0].type).toBe('creation_date');
                expect(result.tokens.some(t => t.type === 'project')).toBe(true);
            });

            it('作成日＋コンテキスト', () => {
                const line = '2025-01-15 Creation date with @context';
                const result = tokenizeLine(line);
                
                expect(result.tokens[0].type).toBe('creation_date');
                expect(result.tokens.some(t => t.type === 'context')).toBe(true);
            });

            it('作成日＋key:value', () => {
                const line = '2025-01-15 Creation date with due:2025-12-31';
                const result = tokenizeLine(line);
                
                expect(result.tokens[0].type).toBe('creation_date');
                expect(result.tokens.some(t => t.type === 'key_value')).toBe(true);
            });
        });

        describe('タグの組み合わせ', () => {
            it('プロジェクト＋コンテキスト', () => {
                const cases = [
                    'Task with +project @context',
                    '@context +project Wrong order but both present',
                    'Task with +project1 @context1 +project2 @context2'
                ];
                
                cases.forEach(line => {
                    const result = tokenizeLine(line);
                    expect(result.tokens.some(t => t.type === 'project')).toBe(true);
                    expect(result.tokens.some(t => t.type === 'context')).toBe(true);
                });
            });

            it('プロジェクト＋key:value', () => {
                const line = 'Task with +project due:2025-12-31';
                const result = tokenizeLine(line);
                
                expect(result.tokens.some(t => t.type === 'project')).toBe(true);
                expect(result.tokens.some(t => t.type === 'key_value')).toBe(true);
            });

            it('コンテキスト＋key:value', () => {
                const cases = [
                    'Task with @context due:2025-12-31',
                    'due:2025-12-31 @context Order matters for key:value',
                    '@context due:2025-12-31 Different order same elements'
                ];
                
                cases.forEach(line => {
                    const result = tokenizeLine(line);
                    expect(result.tokens.some(t => t.type === 'context')).toBe(true);
                    expect(result.tokens.some(t => t.type === 'key_value')).toBe(true);
                });
            });

            it('プロジェクト＋コンテキスト＋key:value', () => {
                const line = 'Task with +project @context due:2025-12-31';
                const result = tokenizeLine(line);
                
                expect(result.tokens.some(t => t.type === 'project')).toBe(true);
                expect(result.tokens.some(t => t.type === 'context')).toBe(true);
                expect(result.tokens.some(t => t.type === 'key_value')).toBe(true);
            });
        });

        describe('3要素の組み合わせ', () => {
            it('優先度＋日付＋プロジェクト', () => {
                const line = '(A) 2025-01-15 Priority, creation date, and +project';
                const result = tokenizeLine(line);
                
                expect(result.tokens[0].type).toBe('priority');
                expect(result.tokens[1].type).toBe('creation_date');
                expect(result.tokens.some(t => t.type === 'project')).toBe(true);
            });

            it('優先度＋日付＋コンテキスト', () => {
                const line = '(A) 2025-01-15 Priority, creation date, and @context';
                const result = tokenizeLine(line);
                
                expect(result.tokens[0].type).toBe('priority');
                expect(result.tokens[1].type).toBe('creation_date');
                expect(result.tokens.some(t => t.type === 'context')).toBe(true);
            });

            it('優先度＋日付＋key:value', () => {
                const line = '(A) 2025-01-15 Priority, creation date, and due:2025-12-31';
                const result = tokenizeLine(line);
                
                expect(result.tokens[0].type).toBe('priority');
                expect(result.tokens[1].type).toBe('creation_date');
                expect(result.tokens.some(t => t.type === 'key_value')).toBe(true);
            });

            it('日付＋プロジェクト＋コンテキスト', () => {
                const line = '2025-01-15 Task with date +project @context';
                const result = tokenizeLine(line);
                
                expect(result.tokens[0].type).toBe('creation_date');
                expect(result.tokens.some(t => t.type === 'project')).toBe(true);
                expect(result.tokens.some(t => t.type === 'context')).toBe(true);
            });

            it('日付＋プロジェクト＋key:value', () => {
                const line = '2025-01-15 Task with date +project due:2025-12-31';
                const result = tokenizeLine(line);
                
                expect(result.tokens[0].type).toBe('creation_date');
                expect(result.tokens.some(t => t.type === 'project')).toBe(true);
                expect(result.tokens.some(t => t.type === 'key_value')).toBe(true);
            });

            it('日付＋コンテキスト＋key:value', () => {
                const line = '2025-01-15 Task with date @context due:2025-12-31';
                const result = tokenizeLine(line);
                
                expect(result.tokens[0].type).toBe('creation_date');
                expect(result.tokens.some(t => t.type === 'context')).toBe(true);
                expect(result.tokens.some(t => t.type === 'key_value')).toBe(true);
            });

            it('優先度＋プロジェクト＋コンテキスト', () => {
                const line = '(A) Task with priority +project @context';
                const result = tokenizeLine(line);
                
                expect(result.tokens[0].type).toBe('priority');
                expect(result.tokens.some(t => t.type === 'project')).toBe(true);
                expect(result.tokens.some(t => t.type === 'context')).toBe(true);
            });

            it('優先度＋プロジェクト＋key:value', () => {
                const line = '(A) Task with priority +project due:2025-12-31';
                const result = tokenizeLine(line);
                
                expect(result.tokens[0].type).toBe('priority');
                expect(result.tokens.some(t => t.type === 'project')).toBe(true);
                expect(result.tokens.some(t => t.type === 'key_value')).toBe(true);
            });

            it('優先度＋コンテキスト＋key:value', () => {
                const line = '(A) Task with priority @context due:2025-12-31';
                const result = tokenizeLine(line);
                
                expect(result.tokens[0].type).toBe('priority');
                expect(result.tokens.some(t => t.type === 'context')).toBe(true);
                expect(result.tokens.some(t => t.type === 'key_value')).toBe(true);
            });
        });

        describe('4要素の組み合わせ', () => {
            it('日付＋プロジェクト＋コンテキスト＋key:value', () => {
                const line = '2025-01-15 Task with date +project @context due:2025-12-31';
                const result = tokenizeLine(line);
                
                expect(result.tokens[0].type).toBe('creation_date');
                expect(result.tokens.some(t => t.type === 'project')).toBe(true);
                expect(result.tokens.some(t => t.type === 'context')).toBe(true);
                expect(result.tokens.some(t => t.type === 'key_value')).toBe(true);
            });

            it('優先度＋プロジェクト＋コンテキスト＋key:value', () => {
                const line = '(A) Task with priority +project @context due:2025-12-31';
                const result = tokenizeLine(line);
                
                expect(result.tokens[0].type).toBe('priority');
                expect(result.tokens.some(t => t.type === 'project')).toBe(true);
                expect(result.tokens.some(t => t.type === 'context')).toBe(true);
                expect(result.tokens.some(t => t.type === 'key_value')).toBe(true);
            });
        });

        describe('全要素の組み合わせ', () => {
            it('優先度＋日付＋プロジェクト＋コンテキスト＋key:value', () => {
                const cases = [
                    '(A) 2025-01-15 All parameters +project @context due:2025-12-31',
                    '(B) 2025-01-14 Different priority and date +project2 @home due:2025-11-30',
                    '(123) 2025-01-13 Numeric priority all params +projectX @work due:2025-10-31'
                ];
                
                cases.forEach(line => {
                    const result = tokenizeLine(line);
                    
                    expect(result.tokens[0].type).toBe('priority');
                    expect(result.tokens[1].type).toBe('creation_date');
                    expect(result.tokens.some(t => t.type === 'project')).toBe(true);
                    expect(result.tokens.some(t => t.type === 'context')).toBe(true);
                    expect(result.tokens.some(t => t.type === 'key_value')).toBe(true);
                });
            });

            it('複雑な組み合わせ', () => {
                const line = '(A) 2025-01-15 Task +project1 +project2 +project3 @context1 @context2 @context3 due:2025-12-31 rec:1w pri:H custom:value foo:bar';
                const result = tokenizeLine(line);
                
                expect(result.tokens[0].type).toBe('priority');
                expect(result.tokens[1].type).toBe('creation_date');
                
                const projectTokens = result.tokens.filter(t => t.type === 'project');
                const contextTokens = result.tokens.filter(t => t.type === 'context');
                const keyValueTokens = result.tokens.filter(t => t.type === 'key_value');
                
                expect(projectTokens.length).toBe(3);
                expect(contextTokens.length).toBe(3);
                expect(keyValueTokens.length).toBeGreaterThan(0);
            });
        });
    });

    describe('複数要素・重複テスト（Multiple Elements & Duplication Tests）', () => {
        it('複数プロジェクト', () => {
            const cases = [
                'Task with multiple +project1 +project2 +project3',
                'Multiple same projects +projectA +projectA +projectA',
                'Task with many projects +p1 +p2 +p3 +p4 +p5 +p6 +p7 +p8 +p9 +p10 +p11 +p12 +p13 +p14 +p15 +p16 +p17 +p18 +p19 +p20'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                const projectTokens = result.tokens.filter(t => t.type === 'project');
                expect(projectTokens.length).toBeGreaterThan(1);
            });
        });

        it('複数コンテキスト', () => {
            const cases = [
                'Task with @home @phone multiple contexts',
                'Multiple same contexts @home @home @home',
                'Task with many contexts @c1 @c2 @c3 @c4 @c5 @c6 @c7 @c8 @c9 @c10 @c11 @c12 @c13 @c14 @c15 @c16 @c17 @c18 @c19 @c20'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                const contextTokens = result.tokens.filter(t => t.type === 'context');
                expect(contextTokens.length).toBeGreaterThan(1);
            });
        });

        it('複数key:valueペア', () => {
            const cases = [
                'Task with multiple pairs due:2025-12-31 rec:1w',
                'Multiple custom keys foo:bar baz:qux in task',
                'Task with many key:value pairs a:1 b:2 c:3 d:4 e:5 f:6 g:7 h:8 i:9 j:10 k:11 l:12 m:13 n:14 o:15'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                const keyValueTokens = result.tokens.filter(t => t.type === 'key_value');
                expect(keyValueTokens.length).toBeGreaterThan(1);
            });
        });

        it('複雑な複数要素の組み合わせ', () => {
            const line = 'Complex task with +project1 +project2 @home @work due:2025-12-31 rec:1m pri:H';
            const result = tokenizeLine(line);
            
            const projectTokens = result.tokens.filter(t => t.type === 'project');
            const contextTokens = result.tokens.filter(t => t.type === 'context');
            const keyValueTokens = result.tokens.filter(t => t.type === 'key_value');
            
            expect(projectTokens.length).toBe(2);
            expect(contextTokens.length).toBe(2);
            expect(keyValueTokens.length).toBe(3);
        });
    });

    describe('特殊文字テスト（Special Character Tests）', () => {
        describe('絵文字', () => {
            it('絵文字を含むプロジェクト', () => {
                const cases = [
                    'Task with emoji project +🚀rocket +📱mobile +🎯target',
                    'Mixed emoji and text +emoji🎯project',
                    'Multiple emojis in one tag +🚀🎯🔥',
                    'Emoji with skin tone +👋🏻project',
                    'Complex emoji +👨‍👩‍👧‍👦family',
                    'Zero-width joiner emoji +🧑‍🚀astronaut'
                ];
                
                cases.forEach(line => {
                    const result = tokenizeLine(line);
                    const projectTokens = result.tokens.filter(t => t.type === 'project');
                    expect(projectTokens.length).toBeGreaterThan(0);
                });
            });

            it('絵文字を含むコンテキスト', () => {
                const cases = [
                    'Task with emoji context @🏠home @💼work @🛒shopping',
                    'Mixed emoji and text @context🔥fire',
                    'Multiple emojis in one tag @🏠💼🛒',
                    'Complex emoji @🏳️‍🌈pride',
                    'Zero-width joiner emoji @👨‍⚕️doctor'
                ];
                
                cases.forEach(line => {
                    const result = tokenizeLine(line);
                    const contextTokens = result.tokens.filter(t => t.type === 'context');
                    expect(contextTokens.length).toBeGreaterThan(0);
                });
            });

            it('絵文字を含む説明文', () => {
                const cases = [
                    'Task with emoji in description 🎉 Complete the feature 🚀 +dev @office',
                    '(A) 2025-01-15 Priority task with emojis 🔥 +🚀deploy @🏠home due:2025-12-31',
                    'x 2025-01-16 Completed emoji task 🎉 +🚀project @🏠home',
                    'Task with unicode émojis 🎯 and special chars'
                ];
                
                cases.forEach(line => {
                    const result = tokenizeLine(line);
                    expect(result.tokens.length).toBeGreaterThan(0);
                });
            });
        });

        describe('特殊記号', () => {
            it('説明文中の特殊記号', () => {
                const cases = [
                    'Task with !@#$%^&*() special chars in description',
                    'Task with quotes "quoted +project" and \'single @quotes\'',
                    'Task with backticks `code +example` @context',
                    'Task with brackets [not a link] +project',
                    'Task with angle brackets <not html> @context',
                    'Task with curly braces {not json} +project',
                    'Task with (parentheses) in description not priority',
                    'Task with [brackets] and {braces} in description'
                ];
                
                cases.forEach(line => {
                    const result = tokenizeLine(line);
                    expect(result.tokens.length).toBeGreaterThan(0);
                });
            });

            it('タグ内の特殊文字', () => {
                const cases = [
                    'Task with special chars in +project-name @context_name',
                    'Task with numbers in +project123 @context456',
                    'Task with dots in +project.name @context.place',
                    'Task with +project!name @context#tag',
                    'Task with +pro-ject_name @con.text_name',
                    'Task with +project/subproject @context\\subcontext',
                    'Task with +project|pipe @context&and',
                    '+123project Project starting with numbers',
                    '@123context Context starting with numbers'
                ];
                
                cases.forEach(line => {
                    const result = tokenizeLine(line);
                    const tagTokens = result.tokens.filter(t => t.type === 'project' || t.type === 'context');
                    expect(tagTokens.length).toBeGreaterThan(0);
                });
            });

            it('エスケープ文字', () => {
                const cases = [
                    'Escaped special chars \\+not-project \\@not-context',
                    'Task with backslash\\\\ in middle'
                ];
                
                cases.forEach(line => {
                    const result = tokenizeLine(line);
                    expect(result.tokens.length).toBeGreaterThan(0);
                });
            });

            it('URLとメールアドレス', () => {
                const cases = [
                    'Task with URL https://example.com/path',
                    'Task with email user@example.com might have @ but not context',
                    'Task with https://example.com/+project/@context/page',
                    '+project@email.com Might confuse parser'
                ];
                
                cases.forEach(line => {
                    const result = tokenizeLine(line);
                    expect(result.tokens.length).toBeGreaterThan(0);
                });
            });

            it('HTMLとエンティティ', () => {
                const cases = [
                    'Task with HTML tags <b>bold</b> text',
                    'Task with & HTML entity &amp; test',
                    'Task with < and > comparison operators',
                    'Task with && and || logical operators'
                ];
                
                cases.forEach(line => {
                    const result = tokenizeLine(line);
                    expect(result.tokens.length).toBeGreaterThan(0);
                });
            });

            it('矢印と演算子', () => {
                const cases = [
                    'Task with -> arrow notation',
                    'Task with => fat arrow',
                    'Task with ... ellipsis'
                ];
                
                cases.forEach(line => {
                    const result = tokenizeLine(line);
                    expect(result.tokens.length).toBeGreaterThan(0);
                });
            });

            it('複雑なkey:value', () => {
                const line = 'Task with key:value:with:colons might break parser';
                const result = tokenizeLine(line);
                const keyValueTokens = result.tokens.filter(t => t.type === 'key_value');
                expect(keyValueTokens.length).toBeGreaterThan(0);
            });
        });

        describe('不可視文字', () => {
            it('ゼロ幅文字', () => {
                const line = 'Task with zero​width​space between words';
                const result = tokenizeLine(line);
                expect(result.tokens.length).toBeGreaterThan(0);
            });

            it('ソフトハイフン', () => {
                const line = 'Task with soft­hyphen in word';
                const result = tokenizeLine(line);
                expect(result.tokens.length).toBeGreaterThan(0);
            });
        });
    });

    describe('多言語テスト（Multilingual Tests）', () => {
        it('日本語', () => {
            const cases = [
                'Task with Japanese text タスク +プロジェクト @コンテキスト',
                'x (A) 2024-01-15 2024-01-10 牛乳を買う +買い物 @スーパー due:2024-01-20'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens.length).toBeGreaterThan(0);
            });
        });

        it('中国語', () => {
            const line = 'Task with Chinese 任务 +项目 @上下文';
            const result = tokenizeLine(line);
            expect(result.tokens.length).toBeGreaterThan(0);
        });

        it('韓国語', () => {
            const line = 'Task with Korean 작업 +프로젝트 @컨텍스트';
            const result = tokenizeLine(line);
            expect(result.tokens.length).toBeGreaterThan(0);
        });

        it('アラビア語（RTL）', () => {
            const line = 'Task with Arabic مهمة +مشروع @سياق';
            const result = tokenizeLine(line);
            expect(result.tokens.length).toBeGreaterThan(0);
        });

        it('ヘブライ語（RTL）', () => {
            const cases = [
                'Task with Hebrew משימה +פרויקט @הקשר',
                'RTL text עברית task with +project @context due:2025-12-31'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens.length).toBeGreaterThan(0);
            });
        });

        it('キリル文字', () => {
            const line = 'Task with Cyrillic задача +проект @контекст';
            const result = tokenizeLine(line);
            expect(result.tokens.length).toBeGreaterThan(0);
        });

        it('混在スクリプト', () => {
            const line = 'Task with mixed scripts +日本語project @中文context';
            const result = tokenizeLine(line);
            const projectTokens = result.tokens.filter(t => t.type === 'project');
            const contextTokens = result.tokens.filter(t => t.type === 'context');
            expect(projectTokens.length).toBe(1);
            expect(contextTokens.length).toBe(1);
        });

        it('結合文字', () => {
            const line = 'Combining marks task̃ +projec̈t @conte͂xt';
            const result = tokenizeLine(line);
            expect(result.tokens.length).toBeGreaterThan(0);
        });

        it('Unicode タグ', () => {
            const line = 'Task with +über @café unicode in tags';
            const result = tokenizeLine(line);
            const projectTokens = result.tokens.filter(t => t.type === 'project');
            const contextTokens = result.tokens.filter(t => t.type === 'context');
            expect(projectTokens.length).toBe(1);
            expect(contextTokens.length).toBe(1);
        });
    });

    describe('空白・インデントテスト（Whitespace & Indentation Tests）', () => {
        it('先頭の空白', () => {
            const cases = [
                '     Task with leading spaces',
                '     (A) 2025-01-15 Task with leading spaces and params     ',
                '     Heavily indented task with many spaces'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens.length).toBeGreaterThan(0);
                
                const nonWhitespaceTokens = result.tokens.filter(t => t.value.trim() !== '');
                expect(nonWhitespaceTokens.length).toBeGreaterThan(0);
            });
        });

        it('末尾の空白', () => {
            const cases = [
                'Task with trailing spaces     ',
                '     (A) 2025-01-15 Task with leading spaces and params     '
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens.length).toBeGreaterThan(0);
            });
        });

        it('タブインデント', () => {
            const cases = [
                '\t\tTask with tab indentation',
                '\t  \tMixed spaces and tabs indentation'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens.length).toBeGreaterThan(0);
            });
        });

        it('要素間の複数スペース', () => {
            const cases = [
                'x  2025-01-16 Completed with double space',
                'x 2025-01-16  2025-01-15 Double space between dates',
                '(A)  2025-01-15 Double space after priority'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens.length).toBeGreaterThan(0);
            });
        });

        it('改行', () => {
            const cases = [
                'Task with trailing newline\n',
                'Task without trailing newline'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens.length).toBeGreaterThan(0);
            });
        });
    });

    describe('エッジケース（Edge Cases）', () => {
        it('不正な順序', () => {
            const cases = [
                '(A) x 2016-04-30 Invalid order task',
                '(A) 2016-05-20 2016-04-30 Task with two dates',
                '(A) No space after priority works as valid format'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens[0].type).toBe('priority');
            });
        });

        it('極端に長い要素', () => {
            const cases = [
                'Task with very long project name +ThisIsAVeryLongProjectNameThatMightCauseIssuesWithSomeSystemsThatHaveLengthLimitsOnIdentifiers',
                'Extremely long task description that goes on and on and on with many words to test how the parser handles very long lines that might exceed buffer limits in some implementations and includes +project @context due:2025-12-31 and continues even further with more text',
                'Long task description that contains many words and might wrap in some views but should still parse correctly with +project @context due:2025-12-31'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens.length).toBeGreaterThan(0);
            });
        });

        it('ファイル拡張子', () => {
            const line = 'Task with file.extension.txt mentions';
            const result = tokenizeLine(line);
            expect(result.tokens.length).toBeGreaterThan(0);
        });

        it('パーサーを混乱させる可能性のあるパターン', () => {
            const cases = [
                '+project Task with only project no description after',
                '@context Task with only context no description after',
                'due:2025-12-31 Task with only key:value no description after',
                '(A) Priority only no task description',
                'x Completed marker only no description',
                'x 2025-01-16 Completed with date only no description',
                '2025-01-15 Date only no description'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens.length).toBeGreaterThan(0);
            });
        });
    });

    describe('追加テストケース（Additional Test Cases）', () => {
        it('セキュリティ関連のパターン', () => {
            const cases = [
                'Task with <script>alert("XSS")</script> attempt',
                'Task with ${injection} attempt',
                'Task with `command` injection',
                'Task with "; DROP TABLE tasks; --',
                'Task with \\\\n\\\\r control characters'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens.length).toBeGreaterThan(0);
            });
        });

        it('境界値テスト', () => {
            const cases = [
                '', // 空文字列
                ' ', // スペースのみ
                '()', // 空の優先度
                '+ ', // 不完全なプロジェクト
                '@ ', // 不完全なコンテキスト
                'key:', // 値のないkey:value
                ':value', // キーのないkey:value
                '2025-13-32', // 無効な日付
                '(999999999999999999999)', // 極端に大きな数値優先度
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                // パーサーがクラッシュしないことを確認
                expect(result).toBeDefined();
                expect(result.tokens).toBeDefined();
            });
        });

        it('パフォーマンステスト用巨大入力', () => {
            // 1000個のプロジェクトタグ
            const manyProjects = Array(1000).fill(0).map((_, i) => `+project${i}`).join(' ');
            const line = `Task with ${manyProjects}`;
            
            const result = tokenizeLine(line);
            const projectTokens = result.tokens.filter(t => t.type === 'project');
            expect(projectTokens.length).toBe(1000);
        });

        it('実用的な複雑なタスク', () => {
            const cases = [
                '(A) 2025-01-15 Review and merge PR #123 +Development +CodeReview @office @urgent due:2025-01-16 pr:123 assignee:john',
                'x 2025-01-16 2025-01-10 🚀 Deploy v2.3.4 to production +Deployment +Release @aws @production version:2.3.4 status:completed',
                '(B) 2025-01-20 📧 Send weekly report to stakeholders +Communication +Reports @email @weekly due:2025-01-20T17:00:00 rec:+1w',
                '(C) Fix bug: Unicode handling in parser 🐛 +BugFix +Parser @development @testing issue:456 estimated:3h',
                'x 2025-01-15 2025-01-14 Refactor authentication module +Backend +Security @code @review pr:789 loc:1234 coverage:95%'
            ];
            
            cases.forEach(line => {
                const result = tokenizeLine(line);
                expect(result.tokens.length).toBeGreaterThan(5);
            });
        });
    });

    describe('トークン位置の正確性（Token Position Accuracy）', () => {
        it('基本的な位置確認', () => {
            const line = 'x (A) 2016-05-20 task +project @context';
            const result = tokenizeLine(line);
            
            result.tokens.forEach(token => {
                const extractedValue = line.substring(token.start, token.end);
                expect(extractedValue).toBe(token.value);
            });
        });

        it('空白を含む位置確認', () => {
            const line = '  x   (A)   2016-05-20   task';
            const result = tokenizeLine(line);
            
            result.tokens.forEach(token => {
                const extractedValue = line.substring(token.start, token.end);
                expect(extractedValue).toBe(token.value);
            });
        });

        it('複雑な行での位置確認', () => {
            const line = '(A) 2025-01-15 Complex task with +project1 +project2 @context1 @context2 due:2025-12-31 rec:1w';
            const result = tokenizeLine(line);
            
            result.tokens.forEach(token => {
                const extractedValue = line.substring(token.start, token.end);
                expect(extractedValue).toBe(token.value);
            });
        });

        it('絵文字を含む行での位置確認', () => {
            const line = 'Task with 🚀 emoji +🎯project @🏠home';
            const result = tokenizeLine(line);
            
            result.tokens.forEach(token => {
                const extractedValue = line.substring(token.start, token.end);
                expect(extractedValue).toBe(token.value);
            });
        });
    });
});
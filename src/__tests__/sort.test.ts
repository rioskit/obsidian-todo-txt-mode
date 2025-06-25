import { parsePriorityValue, parseProjectTag, parseContextTag, parseDueDate } from '../parser';

describe('parser functions', () => {
    describe('parsePriorityValue', () => {
        describe('完了タスク', () => {
            it('基本的な完了タスク', () => {
                expect(parsePriorityValue('x Simple completed task')).toBe(Number.MAX_SAFE_INTEGER);
                expect(parsePriorityValue('x Completed task')).toBe(Number.MAX_SAFE_INTEGER);
            });

            it('スペース付き完了タスク', () => {
                expect(parsePriorityValue('  x Completed task with spaces')).toBe(Number.MAX_SAFE_INTEGER);
                expect(parsePriorityValue('     x Completed task with many spaces')).toBe(Number.MAX_SAFE_INTEGER);
                expect(parsePriorityValue('\t\tx Completed with tabs')).toBe(Number.MAX_SAFE_INTEGER);
            });

            it('日付付き完了タスク', () => {
                expect(parsePriorityValue('x 2025-01-16 Completed task with completion date')).toBe(Number.MAX_SAFE_INTEGER);
                expect(parsePriorityValue('x 2025-01-16 2025-01-15 Completed with both dates')).toBe(Number.MAX_SAFE_INTEGER);
                expect(parsePriorityValue('x  2025-01-16 Completed with double space')).toBe(Number.MAX_SAFE_INTEGER);
            });

            it('優先度付き完了タスク（優先度は無視される）', () => {
                expect(parsePriorityValue('x (B) 2025-01-16 2025-01-15 Complete +🚀')).toBe(Number.MAX_SAFE_INTEGER);
            });
        });

        describe('優先度なし', () => {
            it('シンプルなタスク', () => {
                expect(parsePriorityValue('Simple task without any parameters')).toBe(Number.MAX_SAFE_INTEGER - 1);
                expect(parsePriorityValue('Task without priority')).toBe(Number.MAX_SAFE_INTEGER - 1);
            });

            it('日付付きタスク（優先度なし）', () => {
                expect(parsePriorityValue('2025-01-15 Task with creation date only')).toBe(Number.MAX_SAFE_INTEGER - 1);
                expect(parsePriorityValue('2025-01-15 Date only no description')).toBe(Number.MAX_SAFE_INTEGER - 1);
            });

            it('プロジェクト・コンテキスト付きタスク（優先度なし）', () => {
                expect(parsePriorityValue('Task with +project')).toBe(Number.MAX_SAFE_INTEGER - 1);
                expect(parsePriorityValue('Task with @context')).toBe(Number.MAX_SAFE_INTEGER - 1);
                expect(parsePriorityValue('Task with +project @context due:2025-12-31')).toBe(Number.MAX_SAFE_INTEGER - 1);
            });

            it('説明にカッコを含むが優先度ではないタスク', () => {
                expect(parsePriorityValue('Task with (parentheses) in description not priority')).toBe(Number.MAX_SAFE_INTEGER - 1);
                expect(parsePriorityValue('Task with [brackets] and {braces} in description')).toBe(Number.MAX_SAFE_INTEGER - 1);
            });
        });

        describe('アルファベット優先度', () => {
            it('基本的なA-Z優先度', () => {
                expect(parsePriorityValue('(A) Priority A task')).toBe(0);
                expect(parsePriorityValue('(B) Priority B task')).toBe(1);
                expect(parsePriorityValue('(C) Priority C task')).toBe(2);
                expect(parsePriorityValue('(D) Priority D task')).toBe(3);
                expect(parsePriorityValue('(Z) Priority Z task')).toBe(25);
            });

            it('日付付きアルファベット優先度', () => {
                expect(parsePriorityValue('(A) 2025-01-15 Priority A with creation date')).toBe(0);
                expect(parsePriorityValue('(B) 2025-01-15 Priority B with creation date')).toBe(1);
            });

            it('スペースなしアルファベット優先度', () => {
                expect(parsePriorityValue('(A)No space after priority works as valid format')).toBe(0);
            });

            it('余分なスペース付きアルファベット優先度', () => {
                expect(parsePriorityValue('(A)  2025-01-15 Double space after priority')).toBe(0);
                expect(parsePriorityValue('     (A) 2025-01-15 Task with leading spaces and params     ')).toBe(0);
            });
        });

        describe('数値優先度', () => {
            it('1桁の数値優先度', () => {
                expect(parsePriorityValue('(0) Zero priority task')).toBe(0);
                expect(parsePriorityValue('(1) Single digit priority task')).toBe(1);
                expect(parsePriorityValue('(9) Nine priority task')).toBe(9);
            });

            it('2桁の数値優先度', () => {
                expect(parsePriorityValue('(10) Tenth task')).toBe(10);
                expect(parsePriorityValue('(99) Ninety-nine task')).toBe(99);
            });

            it('3桁の数値優先度', () => {
                expect(parsePriorityValue('(123) Numeric priority task')).toBe(123);
                expect(parsePriorityValue('(999) Three digit priority task')).toBe(999);
            });

            it('大きな数値優先度', () => {
                expect(parsePriorityValue('(999999) Very large numeric priority')).toBe(999999);
                expect(parsePriorityValue('(123456789) Very long numeric priority +project')).toBe(123456789);
            });

            it('日付付き数値優先度', () => {
                expect(parsePriorityValue('(123) 2025-01-15 Numeric priority with creation date')).toBe(123);
                expect(parsePriorityValue('(123) 2025-01-13 Numeric priority all params +projectX @work due:2025-10-31')).toBe(123);
            });
        });

        describe('混合優先度', () => {
            it('数値+文字の混合優先度', () => {
                expect(parsePriorityValue('(1a) Mixed alphanumeric priority task')).toBe(1);
                expect(parsePriorityValue('(10b) Another mixed')).toBe(10);
                expect(parsePriorityValue('(123a) Large number with letter')).toBe(123);
            });

            it('文字+数値の混合優先度', () => {
                expect(parsePriorityValue('(A1) Letter first mixed priority task')).toBe(0);
                expect(parsePriorityValue('(B2) Letter first')).toBe(1);
                expect(parsePriorityValue('(Z9) Letter Z with number')).toBe(25);
            });

            it('複数文字の優先度', () => {
                expect(parsePriorityValue('(ABC) Multi-letter priority task')).toBe(0); // 最初の文字 'A' を使用
                expect(parsePriorityValue('(A1B2C3) Complex alphanumeric priority @context')).toBe(0);
            });
        });

        describe('エッジケースと無効な形式', () => {
            it('優先度のみで説明なし', () => {
                expect(parsePriorityValue('(A) Priority only no task description')).toBe(0);
                expect(parsePriorityValue('(A)')).toBe(0);
            });

            it('特殊なタスク開始パターン', () => {
                expect(parsePriorityValue('+project Task starting with project tag')).toBe(Number.MAX_SAFE_INTEGER - 1);
                expect(parsePriorityValue('@context Task starting with context tag')).toBe(Number.MAX_SAFE_INTEGER - 1);
                expect(parsePriorityValue('due:2025-12-31 Task starting with key value')).toBe(Number.MAX_SAFE_INTEGER - 1);
            });

            it('空行と空白のみの行', () => {
                expect(parsePriorityValue('')).toBe(Number.MAX_SAFE_INTEGER - 1);
                expect(parsePriorityValue('   ')).toBe(Number.MAX_SAFE_INTEGER - 1);
                expect(parsePriorityValue('\t\t')).toBe(Number.MAX_SAFE_INTEGER - 1);
            });
        });
    });

    describe('parseProjectTag', () => {
        describe('基本的なプロジェクトタグ', () => {
            it('シンプルなプロジェクトタグ', () => {
                expect(parseProjectTag('Task with +project')).toBe('project');
                expect(parseProjectTag('Task +project1')).toBe('project1');
                expect(parseProjectTag('Task +Project2 with more text')).toBe('project2');
            });

            it('タスク開始位置のプロジェクトタグ', () => {
                expect(parseProjectTag('+ProjectAtStart')).toBe('projectatstart');
                expect(parseProjectTag('+project Task starting with project tag')).toBe('project');
            });

            it('複数のプロジェクトタグ（最初のものを返す）', () => {
                expect(parseProjectTag('Task +first +second')).toBe('first');
                expect(parseProjectTag('Task with multiple +project1 +project2 +project3')).toBe('project1');
                expect(parseProjectTag('Complex task with +project1 +project2 @home @work due:2025-12-31')).toBe('project1');
            });

            it('大文字小文字の正規化', () => {
                expect(parseProjectTag('Task with +MultiWordProject')).toBe('multiwordproject');
                expect(parseProjectTag('Task with +CamelCaseProject')).toBe('camelcaseproject');
                expect(parseProjectTag('Task with +UPPERCASE')).toBe('uppercase');
            });
        });

        describe('特殊文字を含むプロジェクトタグ', () => {
            it('ハイフン・アンダースコアを含むタグ', () => {
                expect(parseProjectTag('Task with +pro-ject_name')).toBe('pro-ject_name');
                expect(parseProjectTag('Task with +snake_case_project')).toBe('snake_case_project');
                expect(parseProjectTag('Task with +project-name')).toBe('project-name');
            });

            it('ドットを含むタグ', () => {
                expect(parseProjectTag('Task with +project.name')).toBe('project.name');
                expect(parseProjectTag('Task with dots in +project.name @context.place')).toBe('project.name');
            });

            it('数字を含むタグ', () => {
                expect(parseProjectTag('Task with +project123')).toBe('project123');
                expect(parseProjectTag('+123project Project starting with numbers')).toBe('123project');
            });

            it('特殊文字の組み合わせ', () => {
                expect(parseProjectTag('Task with +project!name')).toBe('project!name');
                expect(parseProjectTag('Task with +project/subproject')).toBe('project/subproject');
                expect(parseProjectTag('Task with +project|pipe')).toBe('project|pipe');
            });
        });

        describe('Unicode・多言語プロジェクトタグ', () => {
            it('日本語のプロジェクトタグ', () => {
                expect(parseProjectTag('タスク +プロジェクト @コンテキスト')).toBe('プロジェクト');
                expect(parseProjectTag('Mixed +日本語project @中文context')).toBe('日本語project');
            });

            it('絵文字を含むプロジェクトタグ', () => {
                expect(parseProjectTag('Task with emoji project +🚀rocket')).toBe('🚀rocket');
                expect(parseProjectTag('Task with +🚀 +📱 @🏠')).toBe('🚀');
                expect(parseProjectTag('Mixed emoji and text +emoji🎯project')).toBe('emoji🎯project');
            });

            it('その他の言語', () => {
                expect(parseProjectTag('Task with +über')).toBe('über');
                expect(parseProjectTag('задача +проект @контекст')).toBe('проект');
                expect(parseProjectTag('任务 +项目 @上下文')).toBe('项目');
            });
        });

        describe('プロジェクトタグなし', () => {
            it('プロジェクトタグを含まないタスク', () => {
                expect(parseProjectTag('Task without project')).toBe('zzzz');
                expect(parseProjectTag('Simple task without any parameters')).toBe('zzzz');
                expect(parseProjectTag('Task with @context but no project')).toBe('zzzz');
            });

            it('エスケープされたプロジェクトタグ', () => {
                expect(parseProjectTag('Escaped special chars \\+not-project')).toBe('not-project');
            });
        });

        describe('エッジケース', () => {
            it('プロジェクトタグのみ', () => {
                expect(parseProjectTag('+project Task with only project no description after')).toBe('project');
                expect(parseProjectTag('+project')).toBe('project');
            });

            it('誤解を招く可能性のあるパターン', () => {
                expect(parseProjectTag('+project@email.com Might confuse parser')).toBe('project@email.com');
                expect(parseProjectTag('Task with quotes "+project"')).toBe('project"'); // 引用符も含めて認識される
            });

            it('非常に長いプロジェクト名', () => {
                expect(parseProjectTag('Task with +ThisIsAVeryLongProjectNameThatMightCauseIssuesWithSomeSystemsThatHaveLengthLimitsOnIdentifiers'))
                    .toBe('thisisaverylongprojectnamethatmightcauseissueswithsomesystemsthathavelengthlimitsonidentifiers');
            });
        });
    });

    describe('parseContextTag', () => {
        describe('基本的なコンテキストタグ', () => {
            it('シンプルなコンテキストタグ', () => {
                expect(parseContextTag('Task with @context')).toBe('context');
                expect(parseContextTag('Task @home')).toBe('home');
                expect(parseContextTag('Task @Work with more text')).toBe('work');
            });

            it('タスク開始位置のコンテキストタグ', () => {
                expect(parseContextTag('@ContextAtStart')).toBe('contextatstart');
                expect(parseContextTag('@context Task starting with context tag')).toBe('context');
            });

            it('複数のコンテキストタグ（最初のものを返す）', () => {
                expect(parseContextTag('Task @first @second')).toBe('first');
                expect(parseContextTag('Task with @home @phone multiple contexts')).toBe('home');
                expect(parseContextTag('Multiple same contexts @home @home @home')).toBe('home');
            });

            it('大文字小文字の正規化', () => {
                expect(parseContextTag('Task with @MultiWordContext')).toBe('multiwordcontext');
                expect(parseContextTag('Task with @PascalCaseContext')).toBe('pascalcasecontext');
                expect(parseContextTag('Task with @UPPERCASE')).toBe('uppercase');
            });
        });

        describe('特殊文字を含むコンテキストタグ', () => {
            it('ハイフン・アンダースコアを含むタグ', () => {
                expect(parseContextTag('Task with @con.text_name')).toBe('con.text_name');
                expect(parseContextTag('Task with @kebab-case-context')).toBe('kebab-case-context');
                expect(parseContextTag('Task with @context_name')).toBe('context_name');
            });

            it('数字を含むタグ', () => {
                expect(parseContextTag('Task with @context456')).toBe('context456');
                expect(parseContextTag('@123context Context starting with numbers')).toBe('123context');
            });

            it('特殊文字の組み合わせ', () => {
                expect(parseContextTag('Task with @context#tag')).toBe('context#tag');
                expect(parseContextTag('Task with @context\\subcontext')).toBe('context\\subcontext');
                expect(parseContextTag('Task with @context&and')).toBe('context&and');
            });
        });

        describe('Unicode・多言語コンテキストタグ', () => {
            it('日本語のコンテキストタグ', () => {
                expect(parseContextTag('タスク +プロジェクト @コンテキスト')).toBe('コンテキスト');
                expect(parseContextTag('Mixed +日本語project @中文context')).toBe('中文context');
            });

            it('絵文字を含むコンテキストタグ', () => {
                expect(parseContextTag('Task with emoji context @🏠home')).toBe('🏠home');
                expect(parseContextTag('Task with @🏠 @💼 @🛒')).toBe('🏠');
                expect(parseContextTag('Mixed @context🔥fire')).toBe('context🔥fire');
            });

            it('その他の言語', () => {
                expect(parseContextTag('Task with @café')).toBe('café');
                expect(parseContextTag('작업 +프로젝트 @컨텍스트')).toBe('컨텍스트');
                expect(parseContextTag('משימה +פרויקט @הקשר')).toBe('הקשר');
            });
        });

        describe('コンテキストタグなし', () => {
            it('コンテキストタグを含まないタスク', () => {
                expect(parseContextTag('Task without context')).toBe('zzzz');
                expect(parseContextTag('Simple task without any parameters')).toBe('zzzz');
                expect(parseContextTag('Task with +project but no context')).toBe('zzzz');
            });

            it('メールアドレスの@は無視', () => {
                expect(parseContextTag('Task with email user@example.com might have @ but not context')).toBe('example.com');
            });

            it('エスケープされたコンテキストタグ', () => {
                expect(parseContextTag('Escaped special chars \\@not-context')).toBe('not-context');
            });
        });

        describe('エッジケース', () => {
            it('コンテキストタグのみ', () => {
                expect(parseContextTag('@context Task with only context no description after')).toBe('context');
                expect(parseContextTag('@context')).toBe('context');
            });

            it('複雑な絵文字', () => {
                expect(parseContextTag('Task with @👨‍💻dev')).toBe('👨‍💻dev');
                expect(parseContextTag('Task with @🏳️‍🌈pride')).toBe('🏳️‍🌈pride');
                expect(parseContextTag('Task with @👨‍⚕️doctor')).toBe('👨‍⚕️doctor');
            });

            it('順序が重要なケース', () => {
                expect(parseContextTag('@context+project Wrong order but both present')).toBe('context+project');
                expect(parseContextTag('due:2025-12-31 @context Order matters')).toBe('context');
            });
        });
    });

    describe('parseDueDate', () => {
        describe('基本的な期日', () => {
            it('標準的なdue:日付形式', () => {
                expect(parseDueDate('Task due:2023-12-31')).toBe('2023-12-31');
                expect(parseDueDate('Task with key:value pair due:2025-12-31')).toBe('2025-12-31');
                expect(parseDueDate('due:2024-01-01 Task with date')).toBe('2024-01-01');
            });

            it('タスク開始位置の期日', () => {
                expect(parseDueDate('due:2025-12-31 Task starting with key value')).toBe('2025-12-31');
            });

            it('複数のキー値ペア', () => {
                expect(parseDueDate('Task with multiple pairs due:2025-12-31 rec:1w')).toBe('2025-12-31');
                expect(parseDueDate('Task with many key:value pairs a:1 b:2 due:2025-12-31 c:3')).toBe('2025-12-31');
            });
        });

        describe('時刻付き期日', () => {
            it('ISO形式の時刻付き期日（日付部分のみ抽出）', () => {
                expect(parseDueDate('Task with time due:2025-12-31T14:30:00')).toBe('2025-12-31');
            });
        });

        describe('期日なし', () => {
            it('期日なし（デフォルト：未来）', () => {
                expect(parseDueDate('Task without due date')).toBe('9999-99-99');
                expect(parseDueDate('Simple task without any parameters')).toBe('9999-99-99');
                expect(parseDueDate('Task with +project @context but no due')).toBe('9999-99-99');
            });

            it('期日なし（過去を指定）', () => {
                expect(parseDueDate('Task without due date', false)).toBe('0000-00-00');
                expect(parseDueDate('Simple task', false)).toBe('0000-00-00');
            });
        });

        describe('他のキー値ペア', () => {
            it('recurrenceキー', () => {
                expect(parseDueDate('rec:+1w Recurrence with plus sign')).toBe('9999-99-99');
                expect(parseDueDate('Task with due:2025-12-31 rec:1m')).toBe('2025-12-31');
            });

            it('カスタムキー', () => {
                expect(parseDueDate('Custom key custom:value in task')).toBe('9999-99-99');
                expect(parseDueDate('Multiple custom keys foo:bar baz:qux in task')).toBe('9999-99-99');
                expect(parseDueDate('t:2025-01-15 Short key for date')).toBe('9999-99-99'); // t:はdue:ではない
            });
        });

        describe('エッジケース', () => {
            it('期日のみ', () => {
                expect(parseDueDate('due:2025-12-31 Task with only key:value no description after')).toBe('2025-12-31');
                expect(parseDueDate('due:2025-12-31')).toBe('2025-12-31');
            });

            it('コロンを含む値', () => {
                expect(parseDueDate('Task with key:value:with:colons might break parser')).toBe('9999-99-99');
            });

            it('順序の影響', () => {
                expect(parseDueDate('due:2025-12-31 @context Order matters for key:value')).toBe('2025-12-31');
                expect(parseDueDate('@context due:2025-12-31 Different order same elements')).toBe('2025-12-31');
            });

            it('複雑なタスクでの期日', () => {
                expect(parseDueDate('(A) 2025-01-15 All parameters +project @context due:2025-12-31')).toBe('2025-12-31');
                expect(parseDueDate('Extremely long task description that goes on and on and on with many words to test how the parser handles very long lines that might exceed buffer limits in some implementations and includes +project @context due:2025-12-31 and continues even further with more text'))
                    .toBe('2025-12-31');
            });
        });
    });
});
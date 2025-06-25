// Todo.txt形式の純粋なパーサー関数（Obsidianに依存しない）

export interface Token {
    type: 'completion' | 'priority' | 'completion_date' | 'creation_date' | 'project' | 'context' | 'key_value' | 'text';
    value: string;
    start: number;
    end: number;
}

export interface ParsedLine {
    tokens: Token[];
    raw: string;
}

export function tokenizeLine(line: string): ParsedLine {
    const tokens: Token[] = [];
    let pos = 0;
    const length = line.length;
    let isCompleted = false;
    
    // 先頭の空白をスキップ
    while (pos < length && /\s/.test(line[pos])) {
        pos++;
    }
    
    // 完了フラグ（x）のチェック
    if (pos < length && line[pos] === 'x' && (pos + 1 >= length || /\s/.test(line[pos + 1]))) {
        tokens.push({
            type: 'completion',
            value: 'x',
            start: pos,
            end: pos + 1
        });
        pos++;
        isCompleted = true;
        
        // 完了フラグ後の空白をスキップ
        while (pos < length && /\s/.test(line[pos])) {
            pos++;
        }
    }
    
    // 優先度のチェック（完了フラグの後）
    if (pos < length && line[pos] === '(') {
        const priorityMatch = line.substring(pos).match(/^\(([A-Z0-9][A-Z0-9a-z0-9]*)\)/);
        if (priorityMatch) {
            tokens.push({
                type: 'priority',
                value: priorityMatch[0],
                start: pos,
                end: pos + priorityMatch[0].length
            });
            pos += priorityMatch[0].length;
            
            // 優先度後の空白をスキップ
            while (pos < length && /\s/.test(line[pos])) {
                pos++;
            }
        }
    }
    
    // 完了日のチェック（完了タスクの場合のみ、優先度の後）
    if (isCompleted) {
        const completionDateMatch = line.substring(pos).match(/^(\d{4}-\d{2}-\d{2})/);
        if (completionDateMatch) {
            tokens.push({
                type: 'completion_date',
                value: completionDateMatch[1],
                start: pos,
                end: pos + completionDateMatch[1].length
            });
            pos += completionDateMatch[1].length;
            
            // 完了日後の空白をスキップ
            while (pos < length && /\s/.test(line[pos])) {
                pos++;
            }
        }
    }
    
    // 作成日のチェック（優先度/完了日の後）
    const creationDateMatch = line.substring(pos).match(/^(\d{4}-\d{2}-\d{2})/);
    if (creationDateMatch) {
        tokens.push({
            type: 'creation_date',
            value: creationDateMatch[1],
            start: pos,
            end: pos + creationDateMatch[1].length
        });
        pos += creationDateMatch[1].length;
        
        // 作成日後の空白をスキップ
        while (pos < length && /\s/.test(line[pos])) {
            pos++;
        }
    }
    
    // 残りの部分（タスク本文）を処理
    while (pos < length) {
        const remaining = line.substring(pos);
        
        // プロジェクトタグのチェック
        const projectMatch = remaining.match(/^(\+[^\s]+)/);
        if (projectMatch) {
            tokens.push({
                type: 'project',
                value: projectMatch[1],
                start: pos,
                end: pos + projectMatch[1].length
            });
            pos += projectMatch[1].length;
            continue;
        }
        
        // コンテキストタグのチェック
        const contextMatch = remaining.match(/^(@[^\s]+)/);
        if (contextMatch) {
            tokens.push({
                type: 'context',
                value: contextMatch[1],
                start: pos,
                end: pos + contextMatch[1].length
            });
            pos += contextMatch[1].length;
            continue;
        }
        
        // key:value形式のチェック
        const keyValueMatch = remaining.match(/^([a-zA-Z_][a-zA-Z0-9_]*:[^\s]+)/);
        if (keyValueMatch) {
            tokens.push({
                type: 'key_value',
                value: keyValueMatch[1],
                start: pos,
                end: pos + keyValueMatch[1].length
            });
            pos += keyValueMatch[1].length;
            continue;
        }
        
        // 通常のテキストまたは空白
        const textMatch = remaining.match(/^([^\s]+|\s+)/);
        if (textMatch) {
            if (textMatch[1].trim()) { // 空白でない場合のみテキストトークンとして追加
                tokens.push({
                    type: 'text',
                    value: textMatch[1],
                    start: pos,
                    end: pos + textMatch[1].length
                });
            }
            pos += textMatch[1].length;
        } else {
            // フォールバック
            pos++;
        }
    }
    
    return {
        tokens,
        raw: line
    };
}

export function parsePriorityValue(line: string): number {
    if (line.trim().startsWith('x ')) {
        return Number.MAX_SAFE_INTEGER;
    }
    
    const priorityMatch = line.match(/^\s*\(([A-Z0-9][A-Z0-9a-z0-9]*)\)/);
    if (!priorityMatch) {
        return Number.MAX_SAFE_INTEGER - 1;
    }
    
    const priority = priorityMatch[1];
    if (/^\d+$/.test(priority)) {
        return parseInt(priority, 10);
    }
    
    if (/^\d/.test(priority)) {
        const numericPart = priority.match(/^\d+/);
        if (numericPart) {
            return parseInt(numericPart[0], 10);
        }
    }
    
    return priority.charCodeAt(0) - 'A'.charCodeAt(0);
}

export function parseProjectTag(line: string): string {
    const projectMatch = line.match(/\+([^\s]+)/);
    return projectMatch ? projectMatch[1].toLowerCase() : 'zzzz';
}

export function parseContextTag(line: string): string {
    const contextMatch = line.match(/@([^\s]+)/);
    return contextMatch ? contextMatch[1].toLowerCase() : 'zzzz';
}

export function parseDueDate(line: string, defaultToFuture: boolean = true): string {
    const dueDateMatch = line.match(/due:(\d{4}-\d{2}-\d{2})/);
    if (!dueDateMatch) {
        return defaultToFuture ? '9999-99-99' : '0000-00-00';
    }
    return dueDateMatch[1];
}
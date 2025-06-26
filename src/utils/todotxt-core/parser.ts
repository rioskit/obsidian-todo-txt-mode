export interface ElementPosition {
    value: string;
    start: number;
    end: number;
}

export interface TodoInterface {
    task(): string;
    isDone(): boolean;
    priority(): string | null;
    creationDate(): string | null;
    completionDate(): string | null;
    projects(): string[];
    contexts(): string[];
    keyValues(): Record<string, string>;
    dueDate(): string | null;
}

export interface TodoInterfaceWithPositions extends TodoInterface {
    getElementPositions(): {
        completion: ElementPosition | null;
        priority: ElementPosition | null;
        creationDate: ElementPosition | null;
        completionDate: ElementPosition | null;
        projects: ElementPosition[];
        contexts: ElementPosition[];
        keyValues: ElementPosition[];
    };
}

class TodoImplementation implements TodoInterfaceWithPositions {
    private _task: string;
    private _isDone: boolean;
    private _priority: string | null;
    private _creationDate: string | null;
    private _completionDate: string | null;
    private _projects: string[];
    private _contexts: string[];
    private _keyValues: Record<string, string>;
    
    private _positions: {
        completion: ElementPosition | null;
        priority: ElementPosition | null;
        creationDate: ElementPosition | null;
        completionDate: ElementPosition | null;
        projects: ElementPosition[];
        contexts: ElementPosition[];
        keyValues: ElementPosition[];
    };

    constructor(
        task: string,
        isDone: boolean,
        priority: string | null,
        creationDate: string | null,
        completionDate: string | null,
        projects: string[],
        contexts: string[],
        keyValues: Record<string, string>,
        positions: {
            completion: ElementPosition | null;
            priority: ElementPosition | null;
            creationDate: ElementPosition | null;
            completionDate: ElementPosition | null;
            projects: ElementPosition[];
            contexts: ElementPosition[];
            keyValues: ElementPosition[];
        }
    ) {
        this._task = task;
        this._isDone = isDone;
        this._priority = priority;
        this._creationDate = creationDate;
        this._completionDate = completionDate;
        this._projects = projects;
        this._contexts = contexts;
        this._keyValues = keyValues;
        this._positions = positions;
    }

    task(): string { return this._task; }
    isDone(): boolean { return this._isDone; }
    priority(): string | null { return this._priority; }
    creationDate(): string | null { return this._creationDate; }
    completionDate(): string | null { return this._completionDate; }
    projects(): string[] { return [...this._projects]; }
    contexts(): string[] { return [...this._contexts]; }
    keyValues(): Record<string, string> { return { ...this._keyValues }; }
    dueDate(): string | null { return this._keyValues.due || null; }

    getElementPositions() {
        return {
            completion: this._positions.completion,
            priority: this._positions.priority,
            creationDate: this._positions.creationDate,
            completionDate: this._positions.completionDate,
            projects: [...this._positions.projects],
            contexts: [...this._positions.contexts],
            keyValues: [...this._positions.keyValues]
        };
    }
}

export function parseTodo(line: string): TodoInterfaceWithPositions {
    let pos = 0;
    const length = line.length;
    
    let isCompleted = false;
    let priority: string | null = null;
    let creationDate: string | null = null;
    let completionDate: string | null = null;
    const projects: string[] = [];
    const contexts: string[] = [];
    const keyValues: Record<string, string> = {};
    
    // 位置情報を保持
    const positions: {
        completion: ElementPosition | null;
        priority: ElementPosition | null;
        creationDate: ElementPosition | null;
        completionDate: ElementPosition | null;
        projects: ElementPosition[];
        contexts: ElementPosition[];
        keyValues: ElementPosition[];
    } = {
        completion: null,
        priority: null,
        creationDate: null,
        completionDate: null,
        projects: [],
        contexts: [],
        keyValues: []
    };
    
    // 先頭の空白をスキップ
    while (pos < length && /\s/.test(line[pos])) {
        pos++;
    }
    
    // 1. 完了フラグ（x）のチェック
    if (pos < length && line[pos] === 'x' && (pos + 1 >= length || /\s/.test(line[pos + 1]))) {
        isCompleted = true;
        positions.completion = { value: 'x', start: pos, end: pos + 1 };
        pos++;
        // 完了フラグ後の空白をスキップ
        while (pos < length && /\s/.test(line[pos])) {
            pos++;
        }
    }
    
    // 2. 優先度のチェック（完了していない場合のみ）
    // 完了タスクの場合は優先度をスキップ
    if (pos < length && line[pos] === '(') {
        const remaining = line.substring(pos);
        const priorityMatch = remaining.match(/^\(([A-Z0-9][A-Z0-9a-z0-9]*)\)/);
        if (priorityMatch) {
            if (!isCompleted) {
                priority = priorityMatch[1];
            }
            positions.priority = { 
                value: priorityMatch[0], 
                start: pos, 
                end: pos + priorityMatch[0].length 
            };
            pos += priorityMatch[0].length;
            // 優先度後の空白をスキップ
            while (pos < length && /\s/.test(line[pos])) {
                pos++;
            }
        }
    }
    
    // 3. 完了日と作成日のチェック
    if (pos < length) {
        const remaining = line.substring(pos);
        const firstDateMatch = remaining.match(/^(\d{4}-\d{2}-\d{2})/);
        if (firstDateMatch) {
            const firstDateEnd = pos + firstDateMatch[1].length;
            // 第一の日付の後の空白をスキップして第二の日付を探す
            let nextPos = firstDateEnd;
            while (nextPos < length && /\s/.test(line[nextPos])) {
                nextPos++;
            }
            
            const remainingAfterFirst = line.substring(nextPos);
            const secondDateMatch = remainingAfterFirst.match(/^(\d{4}-\d{2}-\d{2})/);
            
            if (isCompleted) {
                if (secondDateMatch) {
                    // 完了タスクで2つの日付がある場合: 最初が完了日、次が作成日
                    completionDate = firstDateMatch[1];
                    positions.completionDate = {
                        value: firstDateMatch[1],
                        start: pos,
                        end: firstDateEnd
                    };
                    
                    creationDate = secondDateMatch[1];
                    positions.creationDate = {
                        value: secondDateMatch[1],
                        start: nextPos,
                        end: nextPos + secondDateMatch[1].length
                    };
                    pos = nextPos + secondDateMatch[1].length;
                } else {
                    // 完了タスクで1つの日付のみの場合: 完了日
                    completionDate = firstDateMatch[1];
                    positions.completionDate = {
                        value: firstDateMatch[1],
                        start: pos,
                        end: firstDateEnd
                    };
                    pos = firstDateEnd;
                }
            } else {
                // 完了タスクでない場合: 作成日
                creationDate = firstDateMatch[1];
                positions.creationDate = {
                    value: firstDateMatch[1],
                    start: pos,
                    end: firstDateEnd
                };
                pos = firstDateEnd;
            }
            
            // 日付後の空白をスキップ
            while (pos < length && /\s/.test(line[pos])) {
                pos++;
            }
        }
    }
    
    // 5. 残りの部分（タスク本文）を解析
    const taskStartPos = pos;
    const textParts: string[] = [];
    
    while (pos < length) {
        const remaining = line.substring(pos);
        
        // プロジェクトタグのチェック
        const projectMatch = remaining.match(/^(\+[^\s]+)/);
        if (projectMatch) {
            const projectName = projectMatch[1].substring(1);
            projects.push(projectName);
            positions.projects.push({
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
            const contextName = contextMatch[1].substring(1);
            contexts.push(contextName);
            positions.contexts.push({
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
            const colonIndex = keyValueMatch[1].indexOf(':');
            if (colonIndex > 0) {
                const key = keyValueMatch[1].substring(0, colonIndex);
                const value = keyValueMatch[1].substring(colonIndex + 1);
                keyValues[key] = value;
            }
            positions.keyValues.push({
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
            if (textMatch[1].trim()) { // 空白でない場合のみテキストとして追加
                textParts.push(textMatch[1]);
            }
            pos += textMatch[1].length;
        } else {
            // フォールバック
            pos++;
        }
    }
    
    // タスク本文はテキスト部分のみを結合
    const taskText = textParts.join(' ').trim();
    
    return new TodoImplementation(
        taskText,
        isCompleted,
        priority,
        creationDate,
        completionDate,
        projects,
        contexts,
        keyValues,
        positions
    );
}
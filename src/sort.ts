import { App, MarkdownView, Notice, Plugin, TFile, normalizePath } from 'obsidian';
import { SortType, TodoTxtSettings } from './settings';

export class TodoTxtSorter {
    constructor(
        private app: App,
        private settings: TodoTxtSettings,
        private isTodoTxtFile: (path: string) => boolean
    ) {}

    getPriorityValue(line: string): number {
        if (line.trim().startsWith('x ')) {
            return Number.MAX_SAFE_INTEGER;
        }
        
        const priorityMatch = line.match(/^\s*\(([A-Z0-9][A-Z0-9a-z0-9]*)\)/);
        if (!priorityMatch) {
            return Number.MAX_SAFE_INTEGER - 1; // 優先度なしは完了タスクの上
        }
        
        const priority = priorityMatch[1];
        // 数字だけの場合はその値を返す
        if (/^\d+$/.test(priority)) {
            return parseInt(priority, 10);
        }
        
        // 先頭が数字の場合は数値として解釈
        if (/^\d/.test(priority)) {
            const numericPart = priority.match(/^\d+/);
            if (numericPart) {
                return parseInt(numericPart[0], 10);
            }
        }
        
        // 先頭がアルファベットの場合は順序に変換（A=0, B=1, ...）
        // 複数のアルファベットの場合は先頭文字のみを考慮
        return priority.charCodeAt(0) - 'A'.charCodeAt(0);
    }
    
    getProjectTag(line: string): string {
        const projectMatch = line.match(/\+([^\s]+)/);
        return projectMatch ? projectMatch[1].toLowerCase() : 'zzzz'; // プロジェクトなしは最後
    }
    
    getContextTag(line: string): string {
        const contextMatch = line.match(/@([^\s]+)/);
        return contextMatch ? contextMatch[1].toLowerCase() : 'zzzz'; // コンテキストなしは最後
    }
    
    getDueDate(line: string, defaultToFuture: boolean = true): string {
        const dueDateMatch = line.match(/due:(\d{4}-\d{2}-\d{2})/);
        // 期日なしの場合、ソートの種類によって異なる値を返す
        if (!dueDateMatch) {
            return defaultToFuture ? '9999-99-99' : '0000-00-00'; // ソート種別によって最初か最後に
        }
        return dueDateMatch[1];
    }

    registerSortCommands(plugin: Plugin) {
        plugin.addCommand({
            id: 'sort-priority',
            name: 'Sort by priority',
            checkCallback: (checking: boolean) => {
                const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (!activeView || !activeView.file) return false;
                
                const isTodoFile = this.isTodoTxtFile(activeView.file.path);
                if (checking) return isTodoFile;
                
                if (isTodoFile) {
                    this.sortTasks(SortType.Priority);
                }
                return true;
            }
        });
        
        plugin.addCommand({
            id: 'sort-project',
            name: 'Sort by project',
            checkCallback: (checking: boolean) => {
                const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (!activeView || !activeView.file) return false;
                
                const isTodoFile = this.isTodoTxtFile(activeView.file.path);
                if (checking) return isTodoFile;
                
                if (isTodoFile) {
                    this.sortTasks(SortType.Project);
                }
                return true;
            }
        });
        
        plugin.addCommand({
            id: 'sort-context',
            name: 'Sort by context',
            checkCallback: (checking: boolean) => {
                const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (!activeView || !activeView.file) return false;
                
                const isTodoFile = this.isTodoTxtFile(activeView.file.path);
                if (checking) return isTodoFile;
                
                if (isTodoFile) {
                    this.sortTasks(SortType.Context);
                }
                return true;
            }
        });
        
        plugin.addCommand({
            id: 'sort-due-date',
            name: 'Sort by due date',
            checkCallback: (checking: boolean) => {
                const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (!activeView || !activeView.file) return false;
                
                const isTodoFile = this.isTodoTxtFile(activeView.file.path);
                if (checking) return isTodoFile;
                
                if (isTodoFile) {
                    this.sortTasks(SortType.DueDate);
                }
                return true;
            }
        });
    }
    
    async sortTasks(sortType: SortType) {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) {
            new Notice('No active markdown view');
            return;
        }
        
        const file = activeView.file;
        if (!file || !this.isTodoTxtFile(file.path)) {
            new Notice('Active file is not a todo.txt file');
            return;
        }
        
        const content = await this.app.vault.cachedRead(file);
        const lines = content.split('\n');
        
        const boundaryMarker = this.settings.boundaryMarker;
        const boundaryIndex = lines.findIndex(line => line.trim() === boundaryMarker);
        
        let linesToSort: string[] = [];
        let linesAfterBoundary: string[] = [];
        
        if (boundaryIndex !== -1) {
            linesToSort = lines.slice(0, boundaryIndex);
            linesAfterBoundary = lines.slice(boundaryIndex);
        } else {
            linesToSort = lines;
            linesAfterBoundary = [];
        }
        
        const tasksWithOriginalIndices: { line: string, isTask: boolean, isCompleted: boolean, index: number }[] = 
            linesToSort.map((line, index) => {
                const trimmed = line.trim();
                const isTask = trimmed.length > 0 && !trimmed.startsWith('#');
                const isCompleted = isTask && trimmed.startsWith('x ');
                return { line, isTask, isCompleted, index };
            });
        
        const uncompletedTasks = tasksWithOriginalIndices.filter(t => t.isTask && !t.isCompleted);
        const completedTasks = tasksWithOriginalIndices.filter(t => t.isTask && t.isCompleted);
        
        let sortFn: (a: { line: string, index: number }, b: { line: string, index: number }) => number;
        
        switch (sortType) {
            case SortType.Priority:
                sortFn = (a, b) => {
                    const priorityA = this.getPriorityValue(a.line);
                    const priorityB = this.getPriorityValue(b.line);
                    return priorityA - priorityB;
                };
                break;
                
            case SortType.Project:
                sortFn = (a, b) => {
                    const projectA = this.getProjectTag(a.line);
                    const projectB = this.getProjectTag(b.line);
                    return projectA.localeCompare(projectB);
                };
                break;
                
            case SortType.Context:
                sortFn = (a, b) => {
                    const contextA = this.getContextTag(a.line);
                    const contextB = this.getContextTag(b.line);
                    return contextA.localeCompare(contextB);
                };
                break;
                
            case SortType.DueDate:
                sortFn = (a, b) => {
                    const dueDateA = this.getDueDate(a.line, true); // 期日なしは未来日扱い
                    const dueDateB = this.getDueDate(b.line, true);
                    return dueDateA.localeCompare(dueDateB);
                };
                break;
                
            default:
                sortFn = (a, b) => 0; // デフォルトでは並び替えなし
        }
        
        uncompletedTasks.sort(sortFn);
        
        const sortedTasks = [...uncompletedTasks.map(t => t.line), ...completedTasks.map(t => t.line)];
        
        // 区切り文字がある場合のみ1つ空行を追加
        const sortedLines = linesAfterBoundary.length > 0 
            ? [...sortedTasks, '', ...linesAfterBoundary] 
            : sortedTasks;
        await this.app.vault.process(file, (data) => {
            return sortedLines.join('\n');
        });
        
        new Notice(`Tasks sorted by ${sortType}`);
    }

    async moveCompletedTasks() {
        let completedTasks: string[] = [];
        const doneFilePath = this.settings.doneFilePath;
        
        let todoFiles: TFile[] = [];
        
        for (const path of this.settings.todoFilePaths) {
            const file = this.app.vault.getAbstractFileByPath(path);
            if (file instanceof TFile) {
                todoFiles.push(file);
            }
        }
        
        if (todoFiles.length === 0) {
            new Notice('No todo files found matching your configured paths');
            return;
        }
        
        for (const file of todoFiles) {
            const content = await this.app.vault.cachedRead(file);
            const lines = content.split('\n');
            const completedLines: string[] = [];
            const remainingLines: string[] = [];
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('x ')) {
                    completedLines.push(line);
                } else {
                    remainingLines.push(line);
                }
            }
            
            if (completedLines.length > 0) {
                completedTasks = [...completedTasks, ...completedLines];
                await this.app.vault.process(file, (data) => {
                    return remainingLines.join('\n');
                });
            }
        }
        
        if (completedTasks.length > 0) {
            const normalizedDonePath = normalizePath(doneFilePath);
            let doneFile = this.app.vault.getAbstractFileByPath(normalizedDonePath);
            if (!doneFile) {
                try {
                    const dirPath = doneFilePath.substring(0, doneFilePath.lastIndexOf('/'));
                    if (dirPath && !this.app.vault.getAbstractFileByPath(normalizePath(dirPath))) {
                        await this.app.vault.createFolder(normalizePath(dirPath));
                    }
                    
                    doneFile = await this.app.vault.create(doneFilePath, completedTasks.join('\n'));
                } catch (error) {
                    new Notice(`Failed to create done file: ${error}`);
                    return;
                }
            } else if (doneFile instanceof TFile) {
                const existingContent = await this.app.vault.cachedRead(doneFile);
                const newContent = completedTasks.join('\n') + 
                    (existingContent ? '\n' + existingContent : '');
                await this.app.vault.process(doneFile, (data) => {
                    return newContent;
                });
            }
            
            new Notice(`Moved ${completedTasks.length} completed task(s) to ${doneFilePath}`);
        } else {
            new Notice('No completed tasks found');
        }
    }
}
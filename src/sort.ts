import { App, MarkdownView, Notice, Plugin, TFile, normalizePath } from 'obsidian';
import { SortType, TodoTxtSettings } from './settings';
import { parsePriorityValue, parseProjectTag, parseContextTag, parseDueDate } from './parser';

export class TodoTxtSorter {
    constructor(
        private app: App,
        private settings: TodoTxtSettings,
        private isTodoTxtFile: (path: string) => boolean
    ) {}

    getPriorityValue(line: string): number {
        return parsePriorityValue(line);
    }
    
    getProjectTag(line: string): string {
        return parseProjectTag(line);
    }
    
    getContextTag(line: string): string {
        return parseContextTag(line);
    }
    
    getDueDate(line: string, defaultToFuture: boolean = true): string {
        return parseDueDate(line, defaultToFuture);
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
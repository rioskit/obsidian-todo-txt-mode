import { App, MarkdownView, Notice, Plugin, TFile, normalizePath } from 'obsidian';
import { SortType, TodoTxtSettings } from './settings';
import { parseTodo, sortTodosByPriority, sortTodosByProject, sortTodosByContext, sortTodosByDueDate } from './utils/todotxt-core';

export class TodoTxtSorter {
    constructor(
        private app: App,
        private settings: TodoTxtSettings,
        private isTodoTxtFile: (path: string) => boolean
    ) {}


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
        
        // タスク行と非タスク行を分ける（元の行を保持）
        const allLinesWithMeta = linesToSort.map((line, index) => {
            const trimmed = line.trim();
            const isTask = trimmed.length > 0 && !trimmed.startsWith('#');
            const todo = isTask ? parseTodo(line) : null;
            return {
                line,
                isTask,
                todo,
                originalIndex: index
            };
        });
        
        // タスク行のみを抽出
        const taskLines = allLinesWithMeta.filter(item => item.isTask && item.todo);
        const nonTaskLines = allLinesWithMeta.filter(item => !item.isTask);
        
        if (taskLines.length === 0) {
            new Notice('No tasks found to sort');
            return;
        }
        
        // タスクをソート
        const todos = taskLines.map(item => item.todo!);
        let sortedTodos;
        
        switch (sortType) {
            case SortType.Priority:
                sortedTodos = sortTodosByPriority(todos, { completedTasksLast: true });
                break;
            case SortType.Project:
                sortedTodos = sortTodosByProject(todos);
                break;
            case SortType.Context:
                sortedTodos = sortTodosByContext(todos);
                break;
            case SortType.DueDate:
                sortedTodos = sortTodosByDueDate(todos);
                break;
            default:
                sortedTodos = todos; // デフォルトでは並び替えなし
        }
        
        // ソート済みのTodoから元の行文字列を復元
        const sortedTaskLines = sortedTodos.map(sortedTodo => {
            const originalItem = taskLines.find(item => item.todo === sortedTodo);
            return originalItem!.line;
        });
        
        // 非タスク行も元の位置順で保持
        const sortedNonTaskLines = nonTaskLines
            .sort((a, b) => a.originalIndex - b.originalIndex)
            .map(item => item.line);
        
        // 最終的な並び順: ソート済みタスク行 + 非タスク行
        const sortedTasks = [...sortedTaskLines, ...sortedNonTaskLines];
        
        // 区切り文字がある場合のみ1つ空行を追加
        const sortedLines = linesAfterBoundary.length > 0 
            ? [...sortedTasks, '', ...linesAfterBoundary] 
            : sortedTasks;
        await this.app.vault.process(file, (data) => {
            return sortedLines.join('\n');
        });
        
        new Notice(`Tasks sorted by ${sortType}`);
    }

}
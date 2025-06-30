import { App, MarkdownView, Notice, Plugin } from 'obsidian';
import { SortType, TodoTxtSettings } from './settings';
import { parseTodo, sortTodosByPriority, sortTodosByProject, sortTodosByContext, sortTodosByDueDate, isCommentLine } from './utils/todotxt-core';

export function createTodoTxtSorter(
    app: App,
    settings: TodoTxtSettings,
    isTodoTxtFile: (path: string) => boolean
) {
    async function sortTasks(sortType: SortType) {
        const activeView = app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) {
            new Notice('No active markdown view');
            return;
        }
        
        const file = activeView.file;
        if (!file || !isTodoTxtFile(file.path)) {
            new Notice('Active file is not a todo.txt file');
            return;
        }
        
        const content = await app.vault.cachedRead(file);
        const lines = content.split('\n');
        
        const boundaryMarker = settings.boundaryMarker;
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
        
        const allLinesWithMeta = linesToSort.map((line, index) => {
            const trimmed = line.trim();
            const isTask = trimmed.length > 0 && !isCommentLine(trimmed);
            const todo = isTask ? parseTodo(line) : null;
            return {
                line,
                isTask,
                todo,
                originalIndex: index
            };
        });
        
        const taskLines = allLinesWithMeta.filter(item => item.isTask && item.todo);
        const nonTaskLines = allLinesWithMeta.filter(item => !item.isTask);
        
        if (taskLines.length === 0) {
            new Notice('No tasks found to sort');
            return;
        }
        
        const todos = taskLines
            .map(item => item.todo)
            .filter((todo): todo is import('./utils/todotxt-core').TodoInterfaceWithPositions => todo !== null);
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
                sortedTodos = todos;
        }
        
        const sortedTaskLines = sortedTodos.map(sortedTodo => {
            const originalItem = taskLines.find(item => item.todo === sortedTodo);
            return originalItem?.line || '';
        }).filter(line => line !== '');
        
        const sortedNonTaskLines = nonTaskLines
            .sort((a, b) => a.originalIndex - b.originalIndex)
            .map(item => item.line);
        
        const sortedTasks = [...sortedTaskLines, ...sortedNonTaskLines];
        
        const sortedLines = linesAfterBoundary.length > 0 
            ? [...sortedTasks, '', ...linesAfterBoundary] 
            : sortedTasks;
        // Temporarily disable task watcher during sort
        const { setTaskWatcherSorting } = await import('./task-watcher');
        setTaskWatcherSorting(true);
        
        try {
            await app.vault.process(file, () => {
                return sortedLines.join('\n');
            });
        } finally {
            // Re-enable task watcher after sort
            setTimeout(() => {
                setTaskWatcherSorting(false);
            }, 100);
        }
        
        new Notice(`Tasks sorted by ${sortType}`);
    }
    
    return {
        registerSortCommands(plugin: Plugin) {
        plugin.addCommand({
            id: 'sort-priority',
            name: 'Sort by priority',
            checkCallback: (checking: boolean) => {
                const activeView = app.workspace.getActiveViewOfType(MarkdownView);
                if (!activeView || !activeView.file) return false;
                
                const isTodoFile = isTodoTxtFile(activeView.file.path);
                if (checking) return isTodoFile;
                
                if (isTodoFile) {
                    sortTasks(SortType.Priority);
                }
                return true;
            }
        });
        
        plugin.addCommand({
            id: 'sort-project',
            name: 'Sort by project',
            checkCallback: (checking: boolean) => {
                const activeView = app.workspace.getActiveViewOfType(MarkdownView);
                if (!activeView || !activeView.file) return false;
                
                const isTodoFile = isTodoTxtFile(activeView.file.path);
                if (checking) return isTodoFile;
                
                if (isTodoFile) {
                    sortTasks(SortType.Project);
                }
                return true;
            }
        });
        
        plugin.addCommand({
            id: 'sort-context',
            name: 'Sort by context',
            checkCallback: (checking: boolean) => {
                const activeView = app.workspace.getActiveViewOfType(MarkdownView);
                if (!activeView || !activeView.file) return false;
                
                const isTodoFile = isTodoTxtFile(activeView.file.path);
                if (checking) return isTodoFile;
                
                if (isTodoFile) {
                    sortTasks(SortType.Context);
                }
                return true;
            }
        });
        
        plugin.addCommand({
            id: 'sort-due-date',
            name: 'Sort by due date',
            checkCallback: (checking: boolean) => {
                const activeView = app.workspace.getActiveViewOfType(MarkdownView);
                if (!activeView || !activeView.file) return false;
                
                const isTodoFile = isTodoTxtFile(activeView.file.path);
                if (checking) return isTodoFile;
                
                if (isTodoFile) {
                    sortTasks(SortType.DueDate);
                }
                return true;
            }
        });
    },
    
    sortTasks
    };
}
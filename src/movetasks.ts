import { App, Notice, TFile, normalizePath } from 'obsidian';
import { TodoTxtSettings } from './settings';

export function createMoveCompletedTasks(
    app: App, 
    settings: TodoTxtSettings, 
    isTodoTxtFile: (path: string) => boolean
) {
    return async function moveCompletedTasks() {
        let completedTasks: string[] = [];
        const doneFilePath = settings.doneFilePath;
        
        let todoFiles: TFile[] = [];
        
        for (const path of settings.todoFilePaths) {
            const file = app.vault.getAbstractFileByPath(path);
            if (file instanceof TFile) {
                todoFiles.push(file);
            }
        }
        
        if (todoFiles.length === 0) {
            new Notice('No todo files found matching your configured paths');
            return;
        }
        
        for (const file of todoFiles) {
            const content = await app.vault.cachedRead(file);
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
                await app.vault.process(file, (data) => {
                    return remainingLines.join('\n');
                });
            }
        }
        
        if (completedTasks.length > 0) {
            const normalizedDonePath = normalizePath(doneFilePath);
            let doneFile = app.vault.getAbstractFileByPath(normalizedDonePath);
            if (!doneFile) {
                try {
                    const dirPath = doneFilePath.substring(0, doneFilePath.lastIndexOf('/'));
                    if (dirPath && !app.vault.getAbstractFileByPath(normalizePath(dirPath))) {
                        await app.vault.createFolder(normalizePath(dirPath));
                    }
                    
                    doneFile = await app.vault.create(doneFilePath, completedTasks.join('\n'));
                } catch (error) {
                    new Notice(`Failed to create done file: ${error}`);
                    return;
                }
            } else if (doneFile instanceof TFile) {
                const existingContent = await app.vault.cachedRead(doneFile);
                const newContent = completedTasks.join('\n') + 
                    (existingContent ? '\n' + existingContent : '');
                await app.vault.process(doneFile, (data) => {
                    return newContent;
                });
            }
            
            new Notice(`Moved ${completedTasks.length} completed task(s) to ${doneFilePath}`);
        } else {
            new Notice('No completed tasks found');
        }
    };
}
import { ViewPlugin, ViewUpdate, EditorView as CMEditorView, PluginValue } from '@codemirror/view';
import { Transaction, Text } from '@codemirror/state';
import { App } from 'obsidian';
import { parseTodo, TodoInterface, TodoInterfaceWithPositions, shouldAddCompletionDate, addCompletionDate, buildTaskString, getNextRecurringTask, isCompletedTask } from './utils/todotxt-core';
import { TodoTxtSettings } from './settings';

let globalIsSorting = false;

export function setTaskWatcherSorting(sorting: boolean) {
    globalIsSorting = sorting;
}

export function createTaskWatcher(
    app: App, 
    isTodoTxtFile: (path: string) => boolean,
    getSettings: () => TodoTxtSettings
) {
    return ViewPlugin.fromClass(class implements PluginValue {
        view: CMEditorView;
        constructor(view: CMEditorView) {
            this.view = view;
        }
        
        update(update: ViewUpdate) {
            if (!update.docChanged) {
                return;
            }
            
            if (globalIsSorting) {
                return;
            }
            
            const file = app.workspace.getActiveFile();
            if (!file || !isTodoTxtFile(file.path)) {
                return;
            }
            
            const settings = getSettings();
            if (!settings.enableRecurringTasks && !settings.enableAutoCompletionDate) {
                return;
            }
            
            update.transactions.forEach(transaction => {
                this.handleTransaction(transaction, update.view);
            });
        }
        
        handleTransaction(transaction: Transaction, view: CMEditorView) {
            const newDoc = view.state.doc;
            const oldDoc = transaction.startState.doc;
            
            const processedInTransaction = new Set<string>();
            const settings = getSettings();
            
            transaction.changes.iterChanges((fromA, toA, fromB, toB) => {
                if (fromA !== toA && fromB === toB) {
                    return;
                }
                
                const oldFromLine = oldDoc.lineAt(fromA).number;
                
                const newFromLine = newDoc.lineAt(fromB).number;
                const newToLine = fromB === toB ? newFromLine : newDoc.lineAt(toB - 1).number;
                
                for (let lineNum = newFromLine; lineNum <= newToLine; lineNum++) {
                    if (lineNum > newDoc.lines) continue;
                    
                    const line = newDoc.line(lineNum);
                    const lineText = line.text;
                    
                    const lineKey = `${lineNum}:${lineText}`;
                    if (processedInTransaction.has(lineKey)) {
                        continue;
                    }
                    
                    if (isCompletedTask(lineText) && !this.wasAlreadyCompleted(oldDoc, oldFromLine, lineNum, newFromLine)) {
                        this.processNewlyCompletedTask(line, lineText, oldDoc, oldFromLine, lineNum, newFromLine, view, settings, processedInTransaction, lineKey);
                    }
                }
            });
        }
        
        
        private wasAlreadyCompleted(oldDoc: Text, oldFromLine: number, lineNum: number, newFromLine: number): boolean {
            const oldLineNum = oldFromLine + (lineNum - newFromLine);
            if (oldLineNum >= 1 && oldLineNum <= oldDoc.lines) {
                const oldLine = oldDoc.line(oldLineNum);
                return isCompletedTask(oldLine.text);
            }
            return false;
        }
        
        private processNewlyCompletedTask(
            line: { from: number; to: number },
            lineText: string, 
            oldDoc: Text, 
            oldFromLine: number, 
            lineNum: number, 
            newFromLine: number, 
            view: CMEditorView, 
            settings: TodoTxtSettings,
            processedInTransaction: Set<string>,
            lineKey: string
        ) {
            let updatedLineText = lineText;
            
            if (settings.enableAutoCompletionDate) {
                const oldLineText = this.getOldLineText(oldDoc, oldFromLine, lineNum, newFromLine);
                
                if (shouldAddCompletionDate(lineText, oldLineText)) {
                    updatedLineText = addCompletionDate(lineText);
                    this.updateLineText(view, line, updatedLineText);
                    processedInTransaction.add(lineKey);
                }
            }
            
            if (settings.enableRecurringTasks && settings.enableAutoCompletionDate) {
                const todo = parseTodo(updatedLineText);
                const nextTask = this.processRecurringTask(todo);
                
                if (nextTask) {
                    this.insertNewTask(view, line.from, nextTask);
                    processedInTransaction.add(lineKey);
                }
            }
        }
        
        private getOldLineText(oldDoc: Text, oldFromLine: number, lineNum: number, newFromLine: number): string {
            const oldLineNum = oldFromLine + (lineNum - newFromLine);
            const oldText = (oldLineNum >= 1 && oldLineNum <= oldDoc.lines) ? oldDoc.line(oldLineNum).text : '';
            return oldText;
        }
        
        private updateLineText(view: CMEditorView, line: { from: number; to: number }, updatedLineText: string) {
            requestAnimationFrame(() => {
                view.dispatch({
                    changes: {
                        from: line.from,
                        to: line.to,
                        insert: updatedLineText
                    }
                });
            });
        }
        
        
        private processRecurringTask(todo: TodoInterface): TodoInterface | null {
            const keyValues = todo.keyValues();
            const hasRecurrence = keyValues.rec ? keyValues.rec.length > 0 : false;
            
            if (!hasRecurrence) {
                return null;
            }
            
            const settings = getSettings();
            return getNextRecurringTask(todo as TodoInterfaceWithPositions, {
                enableRecurringTaskCreationDate: settings.enableRecurringTaskCreationDate
            });
        }
        
        insertNewTask(view: CMEditorView, position: number, task: TodoInterface) {
            const taskStr = buildTaskString(task);
            
            requestAnimationFrame(() => {
                view.dispatch({
                    changes: {
                        from: position,
                        to: position,
                        insert: taskStr + '\n'
                    }
                });
            });
        }
        
        destroy() {
            // No cleanup needed - task watching is handled by CodeMirror
        }
    });
}
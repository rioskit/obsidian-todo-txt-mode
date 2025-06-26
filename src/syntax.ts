import { Decoration, DecorationSet, EditorView as CMEditorView, ViewPlugin, ViewUpdate, PluginValue } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import { App, TFile } from 'obsidian';
import { TodoTxtSettings } from './settings';
import { parseTodo, ElementPosition } from './utils/todotxt-core';


export function createTodoTxtExtension(app: App, isTodoTxtFile: (path: string) => boolean, getSettings: () => TodoTxtSettings) {
    return ViewPlugin.fromClass(class implements PluginValue {
        decorations: DecorationSet;
        view: CMEditorView;
        lastFile: string | null = null;
        
        
        constructor(view: CMEditorView) {
            this.view = view;
            this.decorations = this.buildDecorations(view);
        }
        
        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged) {
                this.decorations = this.buildDecorations(update.view);
            }
        }
        
        destroy() {
            this.lastFile = null;
        }
        
        buildDecorations(view: CMEditorView): DecorationSet {
            const settings = getSettings();
            const file = app.workspace.getActiveFile();
            
            if (!file || !isTodoTxtFile(file.path)) {
                return Decoration.none;
            }
            
            if (file.path !== this.lastFile) {
                this.lastFile = file.path;
            }
            
            const viewport = view.viewport;
            const doc = view.state.doc;
            
            const decorations: { from: number, to: number, decoration: Decoration }[] = [];
            
            for (let i = viewport.from; i <= viewport.to;) {
                const line = doc.lineAt(i);
                const lineText = line.text;
                
                const todo = parseTodo(lineText);
                const positions = todo.getElementPositions();
                
                // 完了タスクの行全体ハイライト
                if (settings.highlightCompletedTask && todo.isDone()) {
                    const deco = Decoration.line({
                        attributes: { class: "todo-txt-mode-completed" }
                    });
                    decorations.push({
                        from: line.from,
                        to: line.from,
                        decoration: deco
                    });
                }
                
                // 各要素のハイライト処理
                
                // プロジェクトタグのハイライト
                if (settings.highlightProject) {
                    for (const project of positions.projects) {
                        const deco = Decoration.mark({
                            attributes: { class: "todo-txt-mode-project" }
                        });
                        decorations.push({
                            from: line.from + project.start,
                            to: line.from + project.end,
                            decoration: deco
                        });
                    }
                }
                
                // コンテキストタグのハイライト
                if (settings.highlightContext) {
                    for (const context of positions.contexts) {
                        const deco = Decoration.mark({
                            attributes: { class: "todo-txt-mode-context" }
                        });
                        decorations.push({
                            from: line.from + context.start,
                            to: line.from + context.end,
                            decoration: deco
                        });
                    }
                }
                
                // 優先度のハイライト
                if (settings.highlightPriority && positions.priority) {
                    const deco = Decoration.mark({
                        attributes: { class: "todo-txt-mode-priority" }
                    });
                    decorations.push({
                        from: line.from + positions.priority.start,
                        to: line.from + positions.priority.end,
                        decoration: deco
                    });
                }
                
                // 期日のハイライト
                if (settings.highlightDueDate) {
                    for (const keyValue of positions.keyValues) {
                        if (keyValue.value.startsWith('due:')) {
                            const deco = Decoration.mark({
                                attributes: { class: "todo-txt-mode-due-date" }
                            });
                            decorations.push({
                                from: line.from + keyValue.start,
                                to: line.from + keyValue.end,
                                decoration: deco
                            });
                        }
                    }
                }
                
                // 完了日のハイライト
                if (settings.highlightCompletionDate && positions.completionDate) {
                    const deco = Decoration.mark({
                        attributes: { class: "todo-txt-mode-completion-date" }
                    });
                    decorations.push({
                        from: line.from + positions.completionDate.start,
                        to: line.from + positions.completionDate.end,
                        decoration: deco
                    });
                }
                
                // 作成日のハイライト
                if (settings.highlightCreationDate && positions.creationDate) {
                    const deco = Decoration.mark({
                        attributes: { class: "todo-txt-mode-creation-date" }
                    });
                    decorations.push({
                        from: line.from + positions.creationDate.start,
                        to: line.from + positions.creationDate.end,
                        decoration: deco
                    });
                }
                
                i = line.to + 1;
            }
            
            decorations.sort((a, b) => a.from - b.from || a.to - b.to);
            
            if (decorations.length === 0) {
                return Decoration.none;
            }
            
            const builder = new RangeSetBuilder<Decoration>();
            for (const { from, to, decoration } of decorations) {
                builder.add(from, to, decoration);
            }
            
            return builder.finish();
        }
    }, {
        decorations: v => v.decorations
    });
}

import { Decoration, DecorationSet, EditorView as CMEditorView, ViewPlugin, ViewUpdate, PluginValue } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import { App, TFile } from 'obsidian';
import { TodoTxtSettings } from './settings';

export function createTodoTxtExtension(app: App, isTodoTxtFile: (path: string) => boolean, getSettings: () => TodoTxtSettings) {
    const projectRegex = /\+[^\s]+/g;
    const contextRegex = /@[^\s]+/g;
    const priorityRegex = /^(\s*(?:x\s+)?\s*)\(([A-Z0-9][A-Z0-9a-z0-9]*)\)/;
    // const dueDateRegex = /due:(\d{4}-\d{2}-\d{2})/g;
    const dueDateRegex = /due:[^\s]+/g;

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
                const trimmedText = lineText.trim();
                
                if (settings.highlightCompletedTask && trimmedText.startsWith('x ')) {
                    const deco = Decoration.line({
                        attributes: { class: "todo-txt-mode-completed" }
                    });
                    decorations.push({
                        from: line.from,
                        to: line.from,
                        decoration: deco
                    });
                }
                
                if (settings.highlightProject) {
                    projectRegex.lastIndex = 0;
                    let match: RegExpExecArray | null;
                    
                    while ((match = projectRegex.exec(lineText)) !== null) {
                        const start = line.from + match.index;
                        const end = start + match[0].length;
                        const deco = Decoration.mark({
                            attributes: { class: "todo-txt-mode-project" }
                        });
                        decorations.push({
                            from: start,
                            to: end,
                            decoration: deco
                        });
                    }
                }
                
                if (settings.highlightContext) {
                    contextRegex.lastIndex = 0;
                    let match: RegExpExecArray | null;
                    
                    while ((match = contextRegex.exec(lineText)) !== null) {
                        const start = line.from + match.index;
                        const end = start + match[0].length;
                        const deco = Decoration.mark({
                            attributes: { class: "todo-txt-mode-context" }
                        });
                        decorations.push({
                            from: start,
                            to: end,
                            decoration: deco
                        });
                    }
                }
                
                if (settings.highlightPriority) {
                    const priorityMatch = priorityRegex.exec(lineText);
                    if (priorityMatch) {
                        const prefixLength = priorityMatch[1].length;
                        const priorityText = priorityMatch[2];
                        const start = line.from + prefixLength;
                        const end = start + priorityText.length + 2;
                        
                        const deco = Decoration.mark({
                            attributes: { class: "todo-txt-mode-priority" }
                        });
                        
                        decorations.push({
                            from: start,
                            to: end,
                            decoration: deco
                        });
                    }
                }
                
                if (settings.highlightDueDate) {
                    dueDateRegex.lastIndex = 0;
                    let match: RegExpExecArray | null;
                    
                    while ((match = dueDateRegex.exec(lineText)) !== null) {
                        const start = line.from + match.index;
                        const end = start + match[0].length;
                        const deco = Decoration.mark({
                            attributes: { class: "todo-txt-mode-due-date" }
                        });
                        decorations.push({
                            from: start,
                            to: end,
                            decoration: deco
                        });
                    }
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
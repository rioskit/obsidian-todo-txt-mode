import { Decoration, DecorationSet, EditorView as CMEditorView, ViewPlugin, ViewUpdate, PluginValue } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import { App, TFile } from 'obsidian';
import { TodoTxtSettings } from './settings';
import { tokenizeLine, Token } from './parser';


export function createTodoTxtExtension(app: App, isTodoTxtFile: (path: string) => boolean, getSettings: () => TodoTxtSettings) {
    // 正規表現はモジュールレベルで定義されたものを使用

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
                
                // 新しいパーサーを使用してトークン化
                const parsedLine = tokenizeLine(lineText);
                
                // 完了タスクの行全体ハイライト
                const hasCompletion = parsedLine.tokens.some(token => token.type === 'completion');
                if (settings.highlightCompletedTask && hasCompletion) {
                    const deco = Decoration.line({
                        attributes: { class: "todo-txt-mode-completed" }
                    });
                    decorations.push({
                        from: line.from,
                        to: line.from,
                        decoration: deco
                    });
                }
                
                // トークンごとのハイライト処理
                for (const token of parsedLine.tokens) {
                    let className: string | null = null;
                    let shouldHighlight = false;
                    
                    switch (token.type) {
                        case 'project':
                            if (settings.highlightProject) {
                                className = "todo-txt-mode-project";
                                shouldHighlight = true;
                            }
                            break;
                        case 'context':
                            if (settings.highlightContext) {
                                className = "todo-txt-mode-context";
                                shouldHighlight = true;
                            }
                            break;
                        case 'priority':
                            if (settings.highlightPriority) {
                                className = "todo-txt-mode-priority";
                                shouldHighlight = true;
                            }
                            break;
                        case 'key_value':
                            // due: で始まるkey_valueをdue dateとして扱う
                            if (settings.highlightDueDate && token.value.startsWith('due:')) {
                                className = "todo-txt-mode-due-date";
                                shouldHighlight = true;
                            }
                            break;
                        case 'completion_date':
                            if (settings.highlightCompletionDate) {
                                className = "todo-txt-mode-completion-date";
                                shouldHighlight = true;
                            }
                            break;
                        case 'creation_date':
                            if (settings.highlightCreationDate) {
                                className = "todo-txt-mode-creation-date";
                                shouldHighlight = true;
                            }
                            break;
                    }
                    
                    if (shouldHighlight && className) {
                        const deco = Decoration.mark({
                            attributes: { class: className }
                        });
                        decorations.push({
                            from: line.from + token.start,
                            to: line.from + token.end,
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

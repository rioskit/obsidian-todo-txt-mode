import {
	Editor,
	MarkdownView,
	Plugin,
	TFile,
	debounce,
} from 'obsidian';

import { TodoTxtSettings, DEFAULT_SETTINGS, TodoTxtSettingTab } from './settings';
import { createTodoTxtExtension } from './syntax';
import { TodoTxtSorter } from './sort';

export default class TodoTxtPlugin extends Plugin {
	settings: TodoTxtSettings;
	sorter: TodoTxtSorter;
	
	async onload() {
		await this.loadSettings();
		
		this.sorter = new TodoTxtSorter(this.app, this.settings, this.isTodoTxtFile.bind(this));
		
		this.addCommand({
			id: 'todo-txt-done',
			name: 'Move completed tasks to done file',
			callback: async () => {
				await this.sorter.moveCompletedTasks();
			}
		});
		this.sorter.registerSortCommands(this);
		this.addSettingTab(new TodoTxtSettingTab(this.app, this));

		this.registerEditorExtension([
			createTodoTxtExtension(this.app, this.isTodoTxtFile.bind(this), () => this.settings)
		]);
		

		const debouncedEditorChangeHandler = debounce((editor: Editor, markdownView: MarkdownView) => {
			const file = markdownView?.file;
			if (!file || !this.isTodoTxtFile(file.path)) {
				return;
			}

		}, 100, true);
		
		this.registerEvent(
			this.app.workspace.on('editor-change', debouncedEditorChangeHandler)
		);
		
		this.registerEvent(
			this.app.workspace.on('file-open', (file: TFile | null) => {
				if (file && this.isTodoTxtFile(file.path)) {
					this.refreshView();
				}
			})
		);
		
		this.app.workspace.onLayoutReady(() => {
			this.refreshView();
		});
	}

	onunload() {
		if (this.sorter) {
			this.sorter = null as unknown as TodoTxtSorter;
		}
		console.log('Todo.txt Mode plugin unloaded');
	}
	
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
	
	async saveSettings() {
		await this.saveData(this.settings);
		this.refreshView();
	}
	
	public isTodoTxtFile(path: string): boolean {
		return this.settings.todoFilePaths.includes(path) || path === this.settings.doneFilePath;
	}
	
	private refreshView() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView || !activeView.editor) {
			return;
		}
		
		const editor = activeView.editor;
		const content = editor.getValue();
		const cursor = editor.getCursor();
		
		if (content && content.length > 0) {
			editor.setValue(content);
			editor.setCursor(cursor);
		}
	}
}
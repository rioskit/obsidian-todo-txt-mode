import {
	MarkdownView,
	Plugin,
} from 'obsidian';

import { TodoTxtSettings, DEFAULT_SETTINGS, TodoTxtSettingTab, SortType } from './settings';
import { createTodoTxtExtension } from './syntax';
import { createTaskWatcher } from './task-watcher';
import { createTodoTxtSorter } from './sort';
import { createMoveCompletedTasks } from './movetasks';

export default class TodoTxtPlugin extends Plugin {
	settings: TodoTxtSettings;
	sorter?: { registerSortCommands: (plugin: Plugin) => void; sortTasks: (sortType: SortType) => Promise<void> };
	moveCompletedTasks: () => Promise<void>;
	
	async onload() {
		await this.loadSettings();
		
		this.sorter = createTodoTxtSorter(this.app, this.settings, this.isTodoTxtFile.bind(this));
		this.moveCompletedTasks = createMoveCompletedTasks(this.app, this.settings);
		
		this.addCommand({
			id: 'done',
			name: 'Move completed tasks to done file',
			checkCallback: (checking: boolean) => {
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (!activeView || !activeView.file) return false;
				
				const isTodoFile = this.isTodoTxtFile(activeView.file.path);
				if (checking) return isTodoFile;
				
				if (isTodoFile) {
					this.moveCompletedTasks();
				}
				return true;
			}
		});
		this.sorter?.registerSortCommands(this);
		this.addSettingTab(new TodoTxtSettingTab(this.app, this));

		this.registerEditorExtension([
			createTodoTxtExtension(this.app, this.isTodoTxtFile.bind(this), () => this.settings),
			createTaskWatcher(this.app, this.isTodoTxtFile.bind(this), () => this.settings)
		]);
		

	}

	onunload() {
		this.sorter = undefined;
	}
	
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
	
	async saveSettings() {
		await this.saveData(this.settings);
	}
	
	public isTodoTxtFile(path: string): boolean {
		return this.settings.todoFilePaths.includes(path) || path === this.settings.doneFilePath;
	}
}
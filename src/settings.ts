import { App, PluginSettingTab, Setting, normalizePath } from 'obsidian';
import TodoTxtPlugin from './main';

export enum SortType {
    Priority = 'priority',
    Project = 'project',
    Context = 'context',
    DueDate = 'due-date',
}

export interface TodoTxtSettings {
    todoFilePaths: string[];
    doneFilePath: string;

    boundaryMarker: string;

    highlightCompletedTask: boolean;
    completedTaskColor: string;
    
    highlightProject: boolean;
    projectColor: string;
    
    highlightContext: boolean;
    contextColor: string;

    highlightPriority: boolean;
    priorityColor: string;
    
    highlightDueDate: boolean;
    dueDateColor: string;

    highlightCompletionDate: boolean;
    completionDateColor: string;

    highlightCreationDate: boolean;
    creationDateColor: string;
}

export const DEFAULT_SETTINGS: TodoTxtSettings = {
    todoFilePaths: ["todo.md", "idea.md"],
    doneFilePath: "done.md",
    
    boundaryMarker: "--",
    
    highlightCompletedTask: true,
    completedTaskColor: "#808080",
    
    highlightProject: true,
    projectColor: "#4285F4",
    
    highlightContext: true,
    contextColor: "#34A853",
    
    highlightPriority: true,
    priorityColor: "#E91E63",
    
    highlightDueDate: true,
    dueDateColor: "#607D8B",

    highlightCompletionDate: true,
    completionDateColor: "#FF9800",

    highlightCreationDate: true,
    creationDateColor: "#9C27B0"
}

export class TodoTxtSettingTab extends PluginSettingTab {
    plugin: TodoTxtPlugin;
    
    constructor(app: App, plugin: TodoTxtPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    
    /**
     * ハイライト設定項目を作成する共通関数（トグルのみ）
     * @param containerEl コンテナ要素
     * @param name 設定名
     * @param desc 設定の説明
     * @param enableKey 有効/無効の設定キー
     * @param colorKey 色の設定キー（現在は未使用）
     */
    createHighlightSetting(
        containerEl: HTMLElement,
        name: string,
        desc: string,
        enableKey: keyof TodoTxtSettings,
        colorKey: keyof TodoTxtSettings,
    ): void {
        new Setting(containerEl)
            .setName(name)
            .setDesc(desc)
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings[enableKey] as boolean)
                .onChange(async (value) => {
                    (this.plugin.settings[enableKey] as boolean) = value;
                    await this.plugin.saveSettings();
                })
            );
    }
    
    /**
     * テキスト設定項目を作成する共通関数
     * @param containerEl コンテナ要素
     * @param name 設定名
     * @param desc 設定の説明
     * @param placeholder プレースホルダーテキスト
     * @param key 設定キー
     */
    createTextSetting(
        containerEl: HTMLElement, 
        name: string, 
        desc: string, 
        placeholder: string, 
        key: keyof TodoTxtSettings
    ): void {
        new Setting(containerEl)
            .setName(name)
            .setDesc(desc)
            .addText(text => text
                .setPlaceholder(placeholder)
                .setValue(this.plugin.settings[key] as string)
                .onChange(async (value) => {
                    // Normalize path for file path settings
                    const normalizedValue = (key === 'doneFilePath') ? normalizePath(value) : value;
                    (this.plugin.settings[key] as string) = normalizedValue;
                    await this.plugin.saveSettings();
                })
            );
    }
    
    display(): void {
        const {containerEl}: {containerEl: HTMLElement} = this;
        containerEl.empty();
        
        
        const todoFilesSetting = new Setting(containerEl)
            .setName('Todo files')
            .setDesc('Paths to your todo files (relative to vault root)');
        
        todoFilesSetting.addButton(button => button
            .setButtonText('Add todo file')
            .setCta()
            .onClick(async () => {
                this.plugin.settings.todoFilePaths.push('');
                await this.plugin.saveSettings();
                this.display();
            })
        );
        
        const todoFilesContainer = containerEl.createDiv();
        todoFilesContainer.addClass('todo-txt-mode-files-container');
        this.plugin.settings.todoFilePaths.forEach((path, index) => {
            const filePathSetting = new Setting(todoFilesContainer)
                .addText(text => text
                    .setPlaceholder('e.g. /path/to/todo.md')
                    .setValue(path)
                    .onChange(async (value: string) => {
                        this.plugin.settings.todoFilePaths[index] = normalizePath(value);
                        await this.plugin.saveSettings();
                    })
                )
                .addButton(button => button
                    .setIcon('trash')
                    .setTooltip('Remove')
                    .onClick(async () => {
                        this.plugin.settings.todoFilePaths.splice(index, 1);
                        await this.plugin.saveSettings();
                        this.display();
                    })
                );
            filePathSetting.infoEl.remove();
        });
        
        this.createTextSetting(
            containerEl,
            'Done file path',
            'File to store completed tasks (relative to vault root)',
            'e.g. /done.md',
            'doneFilePath'
        );
        
        new Setting(containerEl).setHeading().setName('Highlighting');

        const styleSettingsInfo = containerEl.createEl('div', {
            cls: 'todo-txt-style-settings-info',
        });

        const colorNoteEl = styleSettingsInfo.createEl('p');
        colorNoteEl.setText('To create a custom color scheme use the ');

        const styleSettingsLink = colorNoteEl.createEl('a', {
            text: 'Style Settings',
            href: 'obsidian://show-plugin?id=obsidian-style-settings'
        });
        styleSettingsLink.addClass('todo-txt-style-settings-link');

        colorNoteEl.appendText(' plugin.');

        this.createHighlightSetting(
            containerEl,
            'Highlight completed tasks',
            'Apply strikethrough to completed tasks (starting with "x ")',
            'highlightCompletedTask',
            'completedTaskColor'
        );

        this.createHighlightSetting(
            containerEl,
            'Highlight projects',
            'Apply color to projects ("+project")',
            'highlightProject',
            'projectColor'
        );

        this.createHighlightSetting(
            containerEl,
            'Highlight contexts',
            'Apply color to contexts ("@context")',
            'highlightContext',
            'contextColor'
        );

        this.createHighlightSetting(
            containerEl,
            'Highlight priorities',
            'Apply color to priorities ("(A)", "(1)")',
            'highlightPriority',
            'priorityColor'
        );

        this.createHighlightSetting(
            containerEl,
            'Highlight due dates',
            'Apply color to due dates ("due:yyyy-mm-dd")',
            'highlightDueDate',
            'dueDateColor'
        );

        this.createHighlightSetting(
            containerEl,
            'Highlight completion dates',
            'Apply color to completion dates in completed tasks ("x 2011-03-02")',
            'highlightCompletionDate',
            'completionDateColor'
        );

        this.createHighlightSetting(
            containerEl,
            'Highlight creation dates',
            'Apply color to creation dates ("2011-03-01 Task" or "x date1 2011-03-01")',
            'highlightCreationDate',
            'creationDateColor'
        );
        
        new Setting(containerEl).setHeading().setName('Sort settings');
        
        this.createTextSetting(
            containerEl,
            'Boundary marker',
            'Lines after this marker will not be sorted. Default: "--"',
            '--',
            'boundaryMarker'
        );
    }
}
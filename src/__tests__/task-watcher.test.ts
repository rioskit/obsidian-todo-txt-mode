import { EditorView, ViewPlugin } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { createTaskWatcher } from '../task-watcher';
import { TodoTxtSettings } from '../settings';
jest.mock('../utils/todotxt-core/recurrence', () => ({
    ...jest.requireActual('../utils/todotxt-core/recurrence'),
    getCurrentDate: jest.fn(() => '2025-07-02')
}));
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
    setTimeout(() => callback(0), 0);
    return 0;
};
const mockApp = {
    workspace: {
        getActiveFile: jest.fn()
    }
};
const mockSettings: TodoTxtSettings = {
    todoFilePaths: ['todo.md'],
    doneFilePath: 'done.md',
    boundaryMarker: '--',
    highlightCompletedTask: true,
    completedTaskColor: '#808080',
    highlightProject: true,
    projectColor: '#4285F4',
    highlightContext: true,
    contextColor: '#34A853',
    highlightPriority: true,
    priorityColor: '#E91E63',
    highlightDueDate: true,
    dueDateColor: '#607D8B',
    highlightCompletionDate: true,
    completionDateColor: '#FF9800',
    highlightCreationDate: true,
    creationDateColor: '#9C27B0',
    highlightRecurringTask: true,
    recurringTaskColor: '#FF5722',
    enableRecurringTasks: true,
    enableAutoCompletionDate: true,
    enableRecurringTaskCreationDate: false
};
const mockIsTodoTxtFile = (path: string) => path === 'todo.md';
const mockGetSettings = () => mockSettings;
describe('TaskWatcher', () => {
    let view: EditorView;
    let taskWatcherPlugin: ViewPlugin<{ update: (update: unknown) => void; destroy: () => void }>;
    beforeEach(() => {
        jest.clearAllMocks();
        mockApp.workspace.getActiveFile.mockReturnValue({ path: 'todo.md' });
        const state = EditorState.create({
            doc: 'Task without recurrence\n(A) Task with priority +project @context due:2023-12-25 rec:d'
        });
        view = new EditorView({
            state,
            parent: document.createElement('div')
        });
        taskWatcherPlugin = createTaskWatcher(
            mockApp as unknown as import('obsidian').App,
            mockIsTodoTxtFile,
            mockGetSettings
        );
    });
    afterEach(() => {
        view.destroy();
    });
    describe('Basic functionality', () => {
        it('should not generate recurring tasks when enableRecurringTasks setting is false', async () => {
            mockSettings.enableRecurringTasks = false;
            mockSettings.enableAutoCompletionDate = true;
            const state = EditorState.create({
                doc: 'Task with rec:d',
                extensions: [taskWatcherPlugin]
            });
            const testView = new EditorView({
                state,
                parent: document.createElement('div')
            });
            const dispatchSpy = jest.spyOn(testView, 'dispatch');
            testView.dispatch({
                changes: { from: 0, to: 0, insert: 'x 2025-07-02 ' }
            });
            await new Promise(resolve => setTimeout(resolve, 10));
            expect(dispatchSpy).toHaveBeenCalledTimes(2); // Original + auto completion date only
            testView.destroy();
            mockSettings.enableRecurringTasks = true;
        });
        it('should not generate recurring tasks for files not configured as todo files', async () => {
            mockApp.workspace.getActiveFile.mockReturnValue({ path: 'notes.md' });
            const state = EditorState.create({
                doc: 'Task with rec:d',
                extensions: [taskWatcherPlugin]
            });
            const testView = new EditorView({
                state,
                parent: document.createElement('div')
            });
            const dispatchSpy = jest.spyOn(testView, 'dispatch');
            testView.dispatch({
                changes: { from: 0, to: 0, insert: 'x 2025-07-02 ' }
            });
            await new Promise(resolve => setTimeout(resolve, 10));
            expect(dispatchSpy).toHaveBeenCalledTimes(1); 
            testView.destroy();
        });
    });
    describe('Recurring task creation', () => {
        it('should generate new recurring task with incremented due date when marking task as complete', async () => {
            mockSettings.enableRecurringTasks = true;
            mockSettings.enableAutoCompletionDate = true;
            const state = EditorState.create({
                doc: '(A) Task with priority +project @context due:2025-07-02 rec:d',
                extensions: [taskWatcherPlugin]
            });
            const testView = new EditorView({
                state,
                parent: document.createElement('div')
            });
            const dispatchSpy = jest.spyOn(testView, 'dispatch');
            testView.dispatch({
                changes: { from: 0, to: 0, insert: 'x 2025-07-02 ' }
            });
            await new Promise(resolve => setTimeout(resolve, 20));
            expect(dispatchSpy).toHaveBeenCalledTimes(3); // Original + auto completion date + new recurring task
            const thirdCall = dispatchSpy.mock.calls[2][0];
            expect(thirdCall.changes).toBeDefined();
            const changes = thirdCall.changes;
            if (changes && typeof changes === 'object' && 'insert' in changes) {
                const insertedText = changes.insert as string;
                expect(insertedText).toContain('(A)');
                expect(insertedText).toContain('+project');
                expect(insertedText).toContain('@context');
                expect(insertedText).toContain('due:2025-07-03');
                expect(insertedText).toContain('rec:d');
            }
            testView.destroy();
        });
        it('should not generate new task when completing task without rec: pattern', async () => {
            mockSettings.enableRecurringTasks = true;
            mockSettings.enableAutoCompletionDate = true;
            const state = EditorState.create({
                doc: 'Task without recurrence',
                extensions: [taskWatcherPlugin]
            });
            const testView = new EditorView({
                state,
                parent: document.createElement('div')
            });
            const dispatchSpy = jest.spyOn(testView, 'dispatch');
            testView.dispatch({
                changes: { from: 0, to: 0, insert: 'x 2025-07-02 ' }
            });
            await new Promise(resolve => setTimeout(resolve, 20));
            expect(dispatchSpy).toHaveBeenCalledTimes(2); // Original + auto completion date only (no recurring task)
            testView.destroy();
        });
        it('should not generate recurring task when enableAutoCompletionDate is false', async () => {
            mockSettings.enableRecurringTasks = true;
            mockSettings.enableAutoCompletionDate = false;
            const state = EditorState.create({
                doc: 'Task with rec:d',
                extensions: [taskWatcherPlugin]
            });
            const testView = new EditorView({
                state,
                parent: document.createElement('div')
            });
            const dispatchSpy = jest.spyOn(testView, 'dispatch');
            testView.dispatch({
                changes: { from: 0, to: 0, insert: 'x 2025-07-02 ' }
            });
            await new Promise(resolve => setTimeout(resolve, 20));
            expect(dispatchSpy).toHaveBeenCalledTimes(1); // Only original dispatch, no auto completion, no recurring task
            testView.destroy();
            mockSettings.enableAutoCompletionDate = true;
        });
        it('should skip processing already completed recurring tasks to prevent duplicates', async () => {
            const state = EditorState.create({
                doc: 'Task with rec:d',
                extensions: [taskWatcherPlugin]
            });
            const testView = new EditorView({
                state,
                parent: document.createElement('div')
            });
            const pluginInstance = testView.plugin(taskWatcherPlugin);
            const dispatchSpy = jest.spyOn(testView, 'dispatch');
            testView.dispatch({
                changes: { from: 0, to: 0, insert: 'x 2025-07-02 ' }
            });
            await new Promise(resolve => setTimeout(resolve, 20));
            const callCount = dispatchSpy.mock.calls.length;
            if (pluginInstance && 'update' in pluginInstance) {
                const mockUpdate = {
                    docChanged: true,
                    view: testView,
                    state: testView.state,
                    transactions: []
                } as { docChanged: boolean; view: EditorView; state: EditorState; transactions: unknown[] };
                (pluginInstance as { update: (update: unknown) => void }).update(mockUpdate);
            }
            expect(dispatchSpy).toHaveBeenCalledTimes(callCount);
            testView.destroy();
        });
    });
    describe('Auto completion date', () => {
        it('should insert current date after completion marker when enableAutoCompletionDate is true', async () => {
            mockSettings.enableAutoCompletionDate = true;
            const state = EditorState.create({
                doc: 'Task without completion date',
                extensions: [taskWatcherPlugin]
            });
            const testView = new EditorView({
                state,
                parent: document.createElement('div')
            });
            testView.dispatch({
                changes: { from: 0, to: 0, insert: 'x ' }
            });
            await new Promise(resolve => setTimeout(resolve, 50));
            const finalDoc = testView.state.doc.toString();
            expect(finalDoc).toMatch(/^x 2025-07-02 Task without completion date$/);
            testView.destroy();
        });
        it('should insert completion date between completion marker and existing creation date', async () => {
            mockSettings.enableAutoCompletionDate = true;
            const state = EditorState.create({
                doc: '2023-12-20 Task with creation date',
                extensions: [taskWatcherPlugin]
            });
            const testView = new EditorView({
                state,
                parent: document.createElement('div')
            });
            testView.dispatch({
                changes: { from: 0, to: 0, insert: 'x ' }
            });
            await new Promise(resolve => setTimeout(resolve, 50));
            const finalDoc = testView.state.doc.toString();
            expect(finalDoc).toBe('x 2025-07-02 2023-12-20 Task with creation date');
            testView.destroy();
        });
        it('should not insert completion date when enableAutoCompletionDate is false', async () => {
            mockSettings.enableAutoCompletionDate = false;
            const state = EditorState.create({
                doc: 'Task without completion date',
                extensions: [taskWatcherPlugin]
            });
            const testView = new EditorView({
                state,
                parent: document.createElement('div')
            });
            testView.dispatch({
                changes: { from: 0, to: 0, insert: 'x ' }
            });
            await new Promise(resolve => setTimeout(resolve, 50));
            const finalDoc = testView.state.doc.toString();
            expect(finalDoc).toBe('x Task without completion date');
            testView.destroy();
            mockSettings.enableAutoCompletionDate = true;
        });
        it('should insert completion date even when recurring task generation is disabled', async () => {
            mockSettings.enableAutoCompletionDate = true;
            mockSettings.enableRecurringTasks = false;
            const state = EditorState.create({
                doc: 'Task without completion date',
                extensions: [taskWatcherPlugin]
            });
            const testView = new EditorView({
                state,
                parent: document.createElement('div')
            });
            testView.dispatch({
                changes: { from: 0, to: 0, insert: 'x ' }
            });
            await new Promise(resolve => setTimeout(resolve, 50));
            const finalDoc = testView.state.doc.toString();
            expect(finalDoc).toMatch(/^x 2025-07-02 Task without completion date$/);
            testView.destroy();
            mockSettings.enableRecurringTasks = true;
        });
        it('should insert completion date and generate new recurring task for tasks without creation date', async () => {
            mockSettings.enableAutoCompletionDate = true;
            const state = EditorState.create({
                doc: 'Recurring task rec:d due:2025-07-02',
                extensions: [taskWatcherPlugin]
            });
            const testView = new EditorView({
                state,
                parent: document.createElement('div')
            });
            testView.dispatch({
                changes: { from: 0, to: 0, insert: 'x ' }
            });
            await new Promise(resolve => setTimeout(resolve, 100));
            const doc = testView.state.doc.toString();
            expect(doc).toContain('x 2025-07-02 Recurring task rec:d due:2025-07-02');
            expect(doc).toContain('Recurring task rec:d due:2025-07-03');
            testView.destroy();
        });
        it('should insert completion date and generate new recurring task with current date as creation date', async () => {
            mockSettings.enableAutoCompletionDate = true;
            mockSettings.enableRecurringTaskCreationDate = true;
            const state = EditorState.create({
                doc: '2023-12-20 Recurring task rec:d due:2025-07-02',
                extensions: [taskWatcherPlugin]
            });
            const testView = new EditorView({
                state,
                parent: document.createElement('div')
            });
            testView.dispatch({
                changes: { from: 0, to: 0, insert: 'x ' }
            });
            await new Promise(resolve => setTimeout(resolve, 100));
            const doc = testView.state.doc.toString();
            expect(doc).toContain('x 2025-07-02 2023-12-20 Recurring task rec:d due:2025-07-02');
            expect(doc).toContain('2025-07-02 Recurring task rec:d due:2025-07-03');
            testView.destroy();
        });
        it('should place new recurring task before completed task in document', async () => {
            mockSettings.enableAutoCompletionDate = true;
            mockSettings.enableRecurringTasks = true;
            mockSettings.enableRecurringTaskCreationDate = true;
            const state = EditorState.create({
                doc: '2025-07-01 hoge rec:d due:2025-07-03',
                extensions: [taskWatcherPlugin]
            });
            const testView = new EditorView({
                state,
                parent: document.createElement('div')
            });
            testView.dispatch({
                changes: { from: 0, to: 0, insert: 'x ' }
            });
            await new Promise(resolve => setTimeout(resolve, 100));
            const doc = testView.state.doc.toString();
            const lines = doc.split('\n');
            expect(lines[0]).toBe('2025-07-02 hoge rec:d due:2025-07-03'); 
            expect(lines[1]).toBe('x 2025-07-02 2025-07-01 hoge rec:d due:2025-07-03');
            testView.destroy();
        });
    });
});
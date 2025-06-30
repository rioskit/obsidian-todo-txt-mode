import { TodoInterface } from './parser';

export function buildTaskString(task: TodoInterface): string {
    let taskStr = '';
    
    if (task.priority()) {
        taskStr += `(${task.priority()}) `;
    }
    
    if (task.creationDate()) {
        taskStr += `${task.creationDate()} `;
    }
    
    taskStr += task.task();
    
    for (const project of task.projects()) {
        taskStr += ` +${project}`;
    }
    
    for (const context of task.contexts()) {
        taskStr += ` @${context}`;
    }
    
    const keyValues = task.keyValues();
    for (const [key, value] of Object.entries(keyValues)) {
        taskStr += ` ${key}:${value}`;
    }
    
    return taskStr;
}
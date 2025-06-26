import { parseTodo } from '../parser';

describe('Todo Interface Factory Pattern', () => {
    describe('Basic functionality', () => {
        test('simple task without any parameters', () => {
            const todo = parseTodo('Simple task without any parameters');
            
            expect(todo.task()).toBe('Simple task without any parameters');
            expect(todo.isDone()).toBe(false);
            expect(todo.priority()).toBeNull();
            expect(todo.creationDate()).toBeNull();
            expect(todo.completionDate()).toBeNull();
            expect(todo.projects()).toEqual([]);
            expect(todo.contexts()).toEqual([]);
            expect(todo.keyValues()).toEqual({});
            expect(todo.dueDate()).toBeNull();
        });

        test('completed task', () => {
            const todo = parseTodo('x Simple completed task');
            
            expect(todo.task()).toBe('Simple completed task');
            expect(todo.isDone()).toBe(true);
            expect(todo.priority()).toBeNull();
            expect(todo.creationDate()).toBeNull();
            expect(todo.completionDate()).toBeNull();
            expect(todo.projects()).toEqual([]);
            expect(todo.contexts()).toEqual([]);
            expect(todo.keyValues()).toEqual({});
            expect(todo.dueDate()).toBeNull();
        });

        test('task with priority', () => {
            const todo = parseTodo('(A) Priority A task');
            
            expect(todo.task()).toBe('Priority A task');
            expect(todo.isDone()).toBe(false);
            expect(todo.priority()).toBe('A');
            expect(todo.creationDate()).toBeNull();
            expect(todo.completionDate()).toBeNull();
            expect(todo.projects()).toEqual([]);
            expect(todo.contexts()).toEqual([]);
            expect(todo.keyValues()).toEqual({});
            expect(todo.dueDate()).toBeNull();
        });

        test('task with numeric priority', () => {
            const todo = parseTodo('(123) Numeric priority task');
            
            expect(todo.task()).toBe('Numeric priority task');
            expect(todo.isDone()).toBe(false);
            expect(todo.priority()).toBe('123');
            expect(todo.creationDate()).toBeNull();
            expect(todo.completionDate()).toBeNull();
            expect(todo.projects()).toEqual([]);
            expect(todo.contexts()).toEqual([]);
            expect(todo.keyValues()).toEqual({});
            expect(todo.dueDate()).toBeNull();
        });

        test('task with creation date', () => {
            const todo = parseTodo('2025-01-15 Task with creation date only');
            
            expect(todo.task()).toBe('Task with creation date only');
            expect(todo.isDone()).toBe(false);
            expect(todo.priority()).toBeNull();
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.completionDate()).toBeNull();
            expect(todo.projects()).toEqual([]);
            expect(todo.contexts()).toEqual([]);
            expect(todo.keyValues()).toEqual({});
            expect(todo.dueDate()).toBeNull();
        });

        test('completed task with completion and creation dates', () => {
            const todo = parseTodo('x 2025-01-16 2025-01-15 Completed task with completion and creation dates');
            
            expect(todo.task()).toBe('Completed task with completion and creation dates');
            expect(todo.isDone()).toBe(true);
            expect(todo.priority()).toBeNull();
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.projects()).toEqual([]);
            expect(todo.contexts()).toEqual([]);
            expect(todo.keyValues()).toEqual({});
            expect(todo.dueDate()).toBeNull();
        });

        test('task with project', () => {
            const todo = parseTodo('Task with +project');
            
            expect(todo.task()).toBe('Task with');
            expect(todo.isDone()).toBe(false);
            expect(todo.priority()).toBeNull();
            expect(todo.creationDate()).toBeNull();
            expect(todo.completionDate()).toBeNull();
            expect(todo.projects()).toEqual(['project']);
            expect(todo.contexts()).toEqual([]);
            expect(todo.keyValues()).toEqual({});
            expect(todo.dueDate()).toBeNull();
        });

        test('task with multiple projects', () => {
            const todo = parseTodo('Task with multiple +project1 +project2 +project3');
            
            expect(todo.task()).toBe('Task with multiple');
            expect(todo.isDone()).toBe(false);
            expect(todo.priority()).toBeNull();
            expect(todo.creationDate()).toBeNull();
            expect(todo.completionDate()).toBeNull();
            expect(todo.projects()).toEqual(['project1', 'project2', 'project3']);
            expect(todo.contexts()).toEqual([]);
            expect(todo.keyValues()).toEqual({});
            expect(todo.dueDate()).toBeNull();
        });

        test('task with context', () => {
            const todo = parseTodo('Task with @context');
            
            expect(todo.task()).toBe('Task with');
            expect(todo.isDone()).toBe(false);
            expect(todo.priority()).toBeNull();
            expect(todo.creationDate()).toBeNull();
            expect(todo.completionDate()).toBeNull();
            expect(todo.projects()).toEqual([]);
            expect(todo.contexts()).toEqual(['context']);
            expect(todo.keyValues()).toEqual({});
            expect(todo.dueDate()).toBeNull();
        });

        test('task with multiple contexts', () => {
            const todo = parseTodo('Task with @home @phone multiple contexts');
            
            expect(todo.task()).toBe('Task with multiple contexts');
            expect(todo.isDone()).toBe(false);
            expect(todo.priority()).toBeNull();
            expect(todo.creationDate()).toBeNull();
            expect(todo.completionDate()).toBeNull();
            expect(todo.projects()).toEqual([]);
            expect(todo.contexts()).toEqual(['home', 'phone']);
            expect(todo.keyValues()).toEqual({});
            expect(todo.dueDate()).toBeNull();
        });

        test('task with key:value pair', () => {
            const todo = parseTodo('Task with key:value pair due:2025-12-31');
            
            expect(todo.task()).toBe('Task with pair');
            expect(todo.isDone()).toBe(false);
            expect(todo.priority()).toBeNull();
            expect(todo.creationDate()).toBeNull();
            expect(todo.completionDate()).toBeNull();
            expect(todo.projects()).toEqual([]);
            expect(todo.contexts()).toEqual([]);
            expect(todo.keyValues()).toEqual({ key: 'value', due: '2025-12-31' });
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('task with multiple key:value pairs', () => {
            const todo = parseTodo('Task with multiple pairs due:2025-12-31 rec:1w');
            
            expect(todo.task()).toBe('Task with multiple pairs');
            expect(todo.isDone()).toBe(false);
            expect(todo.priority()).toBeNull();
            expect(todo.creationDate()).toBeNull();
            expect(todo.completionDate()).toBeNull();
            expect(todo.projects()).toEqual([]);
            expect(todo.contexts()).toEqual([]);
            expect(todo.keyValues()).toEqual({ due: '2025-12-31', rec: '1w' });
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('complex example from user request', () => {
            const todo = parseTodo('x 2024-01-10 2024-01-05 Renew gym membership +fitness');
            
            expect(todo.task()).toBe('Renew gym membership');
            expect(todo.isDone()).toBe(true);
            expect(todo.priority()).toBeNull();
            expect(todo.creationDate()).toBe('2024-01-05');
            expect(todo.completionDate()).toBe('2024-01-10');
            expect(todo.projects()).toEqual(['fitness']);
            expect(todo.contexts()).toEqual([]);
            expect(todo.keyValues()).toEqual({});
            expect(todo.dueDate()).toBeNull();
        });

        test('all parameters example', () => {
            const todo = parseTodo('(A) 2025-01-15 All parameters +project @context due:2025-12-31');
            
            expect(todo.task()).toBe('All parameters');
            expect(todo.isDone()).toBe(false);
            expect(todo.priority()).toBe('A');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.completionDate()).toBeNull();
            expect(todo.projects()).toEqual(['project']);
            expect(todo.contexts()).toEqual(['context']);
            expect(todo.keyValues()).toEqual({ due: '2025-12-31' });
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('completed all parameters example', () => {
            const todo = parseTodo('x 2025-01-16 2025-01-15 Completed all params +project @context due:2025-12-31');
            
            expect(todo.task()).toBe('Completed all params');
            expect(todo.isDone()).toBe(true);
            expect(todo.priority()).toBeNull();
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.projects()).toEqual(['project']);
            expect(todo.contexts()).toEqual(['context']);
            expect(todo.keyValues()).toEqual({ due: '2025-12-31' });
            expect(todo.dueDate()).toBe('2025-12-31');
        });
    });

    describe('Todo.txt samples', () => {
        test('sample 1: Simple task without any parameters', () => {
            const todo = parseTodo('Simple task without any parameters');
            expect(todo.task()).toBe('Simple task without any parameters');
            expect(todo.isDone()).toBe(false);
            expect(todo.priority()).toBeNull();
            expect(todo.creationDate()).toBeNull();
            expect(todo.completionDate()).toBeNull();
            expect(todo.projects()).toEqual([]);
            expect(todo.contexts()).toEqual([]);
            expect(todo.keyValues()).toEqual({});
            expect(todo.dueDate()).toBeNull();
        });

        test('sample 2: (A) Priority A task', () => {
            const todo = parseTodo('(A) Priority A task');
            expect(todo.task()).toBe('Priority A task');
            expect(todo.isDone()).toBe(false);
            expect(todo.priority()).toBe('A');
            expect(todo.creationDate()).toBeNull();
            expect(todo.completionDate()).toBeNull();
            expect(todo.projects()).toEqual([]);
            expect(todo.contexts()).toEqual([]);
            expect(todo.keyValues()).toEqual({});
            expect(todo.dueDate()).toBeNull();
        });

        test('sample 6: (123) Numeric priority task', () => {
            const todo = parseTodo('(123) Numeric priority task');
            expect(todo.task()).toBe('Numeric priority task');
            expect(todo.isDone()).toBe(false);
            expect(todo.priority()).toBe('123');
        });

        test('sample 9: 2025-01-15 Task with creation date only', () => {
            const todo = parseTodo('2025-01-15 Task with creation date only');
            expect(todo.task()).toBe('Task with creation date only');
            expect(todo.isDone()).toBe(false);
            expect(todo.priority()).toBeNull();
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.completionDate()).toBeNull();
        });

        test('sample 13: Task with +project', () => {
            const todo = parseTodo('Task with +project');
            expect(todo.task()).toBe('Task with');
            expect(todo.projects()).toEqual(['project']);
        });

        test('sample 15: Task with multiple +project1 +project2 +project3', () => {
            const todo = parseTodo('Task with multiple +project1 +project2 +project3');
            expect(todo.task()).toBe('Task with multiple');
            expect(todo.projects()).toEqual(['project1', 'project2', 'project3']);
        });

        test('sample 16: Task with @context', () => {
            const todo = parseTodo('Task with @context');
            expect(todo.task()).toBe('Task with');
            expect(todo.contexts()).toEqual(['context']);
        });

        test('sample 17: Task with @home @phone multiple contexts', () => {
            const todo = parseTodo('Task with @home @phone multiple contexts');
            expect(todo.task()).toBe('Task with multiple contexts');
            expect(todo.contexts()).toEqual(['home', 'phone']);
        });

        test('sample 19: Task with key:value pair due:2025-12-31', () => {
            const todo = parseTodo('Task with key:value pair due:2025-12-31');
            expect(todo.task()).toBe('Task with pair');
            expect(todo.keyValues()).toEqual({ key: 'value', due: '2025-12-31' });
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 20: Task with multiple pairs due:2025-12-31 rec:1w', () => {
            const todo = parseTodo('Task with multiple pairs due:2025-12-31 rec:1w');
            expect(todo.task()).toBe('Task with multiple pairs');
            expect(todo.keyValues()).toEqual({ due: '2025-12-31', rec: '1w' });
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 42: (A) 2025-01-15 All parameters +project @context due:2025-12-31', () => {
            const todo = parseTodo('(A) 2025-01-15 All parameters +project @context due:2025-12-31');
            expect(todo.task()).toBe('All parameters');
            expect(todo.isDone()).toBe(false);
            expect(todo.priority()).toBe('A');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.completionDate()).toBeNull();
            expect(todo.projects()).toEqual(['project']);
            expect(todo.contexts()).toEqual(['context']);
            expect(todo.keyValues()).toEqual({ due: '2025-12-31' });
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 45: x Simple completed task', () => {
            const todo = parseTodo('x Simple completed task');
            expect(todo.task()).toBe('Simple completed task');
            expect(todo.isDone()).toBe(true);
            expect(todo.priority()).toBeNull();
            expect(todo.creationDate()).toBeNull();
            expect(todo.completionDate()).toBeNull();
        });

        test('sample 47: x 2025-01-16 2025-01-15 Completed task with completion and creation dates', () => {
            const todo = parseTodo('x 2025-01-16 2025-01-15 Completed task with completion and creation dates');
            expect(todo.task()).toBe('Completed task with completion and creation dates');
            expect(todo.isDone()).toBe(true);
            expect(todo.priority()).toBeNull();
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.completionDate()).toBe('2025-01-16');
        });

        test('sample 58: x 2025-01-16 2025-01-15 Completed all params +project @context due:2025-12-31', () => {
            const todo = parseTodo('x 2025-01-16 2025-01-15 Completed all params +project @context due:2025-12-31');
            expect(todo.task()).toBe('Completed all params');
            expect(todo.isDone()).toBe(true);
            expect(todo.priority()).toBeNull();
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.projects()).toEqual(['project']);
            expect(todo.contexts()).toEqual(['context']);
            expect(todo.keyValues()).toEqual({ due: '2025-12-31' });
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 65: Complex task with +project1 +project2 @home @work due:2025-12-31 rec:1m pri:H', () => {
            const todo = parseTodo('Complex task with +project1 +project2 @home @work due:2025-12-31 rec:1m pri:H');
            expect(todo.task()).toBe('Complex task with');
            expect(todo.projects()).toEqual(['project1', 'project2']);
            expect(todo.contexts()).toEqual(['home', 'work']);
            expect(todo.keyValues()).toEqual({
                due: '2025-12-31',
                rec: '1m',
                pri: 'H'
            });
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 102: Task with emoji project +🚀rocket +📱mobile +🎯target', () => {
            const todo = parseTodo('Task with emoji project +🚀rocket +📱mobile +🎯target');
            expect(todo.task()).toBe('Task with emoji project');
            expect(todo.projects()).toEqual(['🚀rocket', '📱mobile', '🎯target']);
        });

        test('sample 140: Task with many projects +p1 +p2 +p3 +p4 +p5 +p6 +p7 +p8 +p9 +p10 +p11 +p12 +p13 +p14 +p15 +p16 +p17 +p18 +p19 +p20', () => {
            const todo = parseTodo('Task with many projects +p1 +p2 +p3 +p4 +p5 +p6 +p7 +p8 +p9 +p10 +p11 +p12 +p13 +p14 +p15 +p16 +p17 +p18 +p19 +p20');
            expect(todo.task()).toBe('Task with many projects');
            expect(todo.projects()).toHaveLength(20);
            expect(todo.projects()).toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15', 'p16', 'p17', 'p18', 'p19', 'p20']);
        });

        test('sample 141: Task with many contexts @c1 @c2 @c3 @c4 @c5 @c6 @c7 @c8 @c9 @c10 @c11 @c12 @c13 @c14 @c15 @c16 @c17 @c18 @c19 @c20', () => {
            const todo = parseTodo('Task with many contexts @c1 @c2 @c3 @c4 @c5 @c6 @c7 @c8 @c9 @c10 @c11 @c12 @c13 @c14 @c15 @c16 @c17 @c18 @c19 @c20');
            expect(todo.task()).toBe('Task with many contexts');
            expect(todo.contexts()).toHaveLength(20);
            expect(todo.contexts()).toEqual(['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12', 'c13', 'c14', 'c15', 'c16', 'c17', 'c18', 'c19', 'c20']);
        });

        test('sample 142: Task with many key:value pairs a:1 b:2 c:3 d:4 e:5 f:6 g:7 h:8 i:9 j:10 k:11 l:12 m:13 n:14 o:15', () => {
            const todo = parseTodo('Task with many key:value pairs a:1 b:2 c:3 d:4 e:5 f:6 g:7 h:8 i:9 j:10 k:11 l:12 m:13 n:14 o:15');
            expect(todo.task()).toBe('Task with many pairs');
            expect(todo.keyValues()).toEqual({
                key: 'value',
                a: '1', b: '2', c: '3', d: '4', e: '5',
                f: '6', g: '7', h: '8', i: '9', j: '10',
                k: '11', l: '12', m: '13', n: '14', o: '15'
            });
        });

        test('sample 76: Multiple custom keys foo:bar baz:qux in task', () => {
            const todo = parseTodo('Multiple custom keys foo:bar baz:qux in task');
            expect(todo.task()).toBe('Multiple custom keys in task');
            expect(todo.keyValues()).toEqual({ foo: 'bar', baz: 'qux' });
        });

        test('sample 95: Task with +über @café unicode in tags', () => {
            const todo = parseTodo('Task with +über @café unicode in tags');
            expect(todo.task()).toBe('Task with unicode in tags');
            expect(todo.projects()).toEqual(['über']);
            expect(todo.contexts()).toEqual(['café']);
        });

        test('sample 147: (A) Priority only no task description', () => {
            const todo = parseTodo('(A) Priority only no task description');
            expect(todo.task()).toBe('Priority only no task description');
            expect(todo.priority()).toBe('A');
        });

        test('sample 148: x Completed marker only no description', () => {
            const todo = parseTodo('x Completed marker only no description');
            expect(todo.task()).toBe('Completed marker only no description');
            expect(todo.isDone()).toBe(true);
        });

        test('sample 150: 2025-01-15 Date only no description', () => {
            const todo = parseTodo('2025-01-15 Date only no description');
            expect(todo.task()).toBe('Date only no description');
            expect(todo.creationDate()).toBe('2025-01-15');
        });

        test('sample 69: Task with time due:2025-12-31T14:30:00', () => {
            const todo = parseTodo('Task with time due:2025-12-31T14:30:00');
            expect(todo.task()).toBe('Task with time');
            expect(todo.keyValues()).toEqual({ due: '2025-12-31T14:30:00' });
            expect(todo.dueDate()).toBe('2025-12-31T14:30:00');
        });

        test('sample 93: Task with key:value:with:colons might break parser', () => {
            const todo = parseTodo('Task with key:value:with:colons might break parser');
            expect(todo.task()).toBe('Task with might break parser');
            expect(todo.keyValues()).toEqual({ key: 'value:with:colons' });
        });

        test('sample 78: Task with email user@example.com might have @ but not context', () => {
            const todo = parseTodo('Task with email user@example.com might have @ but not context');
            expect(todo.task()).toBe('Task with email user@example.com might have @ but not context');
            expect(todo.contexts()).toEqual([]);
        });

        test('sample 135: x (B) 2025-01-16 2025-01-15 Complete +🚀 +📱 @🏠 @💼 due:2025-12-31 done:2025-01-16', () => {
            const todo = parseTodo('x (B) 2025-01-16 2025-01-15 Complete +🚀 +📱 @🏠 @💼 due:2025-12-31 done:2025-01-16');
            expect(todo.task()).toBe('Complete');
            expect(todo.isDone()).toBe(true);
            expect(todo.priority()).toBeNull();
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.projects()).toEqual(['🚀', '📱']);
            expect(todo.contexts()).toEqual(['🏠', '💼']);
            expect(todo.keyValues()).toEqual({ due: '2025-12-31', done: '2025-01-16' });
        });

        test('sample 3: (B) Priority B task', () => {
            const todo = parseTodo('(B) Priority B task');
            expect(todo.priority()).toBe('B');
            expect(todo.task()).toBe('Priority B task');
            expect(todo.isDone()).toBe(false);
        });

        test('sample 4: (C) Priority C task', () => {
            const todo = parseTodo('(C) Priority C task');
            expect(todo.priority()).toBe('C');
            expect(todo.task()).toBe('Priority C task');
        });

        test('sample 5: (Z) Priority Z task', () => {
            const todo = parseTodo('(Z) Priority Z task');
            expect(todo.priority()).toBe('Z');
            expect(todo.task()).toBe('Priority Z task');
        });

        test('sample 7: (1) Single digit priority task', () => {
            const todo = parseTodo('(1) Single digit priority task');
            expect(todo.priority()).toBe('1');
            expect(todo.task()).toBe('Single digit priority task');
        });

        test('sample 8: (999) Three digit priority task', () => {
            const todo = parseTodo('(999) Three digit priority task');
            expect(todo.priority()).toBe('999');
            expect(todo.task()).toBe('Three digit priority task');
        });

        test('sample 10: (A) 2025-01-15 Priority A with creation date', () => {
            const todo = parseTodo('(A) 2025-01-15 Priority A with creation date');
            expect(todo.priority()).toBe('A');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Priority A with creation date');
        });

        test('sample 11: (B) 2025-01-15 Priority B with creation date', () => {
            const todo = parseTodo('(B) 2025-01-15 Priority B with creation date');
            expect(todo.priority()).toBe('B');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Priority B with creation date');
        });

        test('sample 12: (123) 2025-01-15 Numeric priority with creation date', () => {
            const todo = parseTodo('(123) 2025-01-15 Numeric priority with creation date');
            expect(todo.priority()).toBe('123');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Numeric priority with creation date');
        });

        test('sample 14: Task with +MultiWordProject', () => {
            const todo = parseTodo('Task with +MultiWordProject');
            expect(todo.task()).toBe('Task with');
            expect(todo.projects()).toEqual(['MultiWordProject']);
        });

        test('sample 18: Task with @MultiWordContext', () => {
            const todo = parseTodo('Task with @MultiWordContext');
            expect(todo.task()).toBe('Task with');
            expect(todo.contexts()).toEqual(['MultiWordContext']);
        });

        test('sample 21: 2025-01-15 Creation date with +project', () => {
            const todo = parseTodo('2025-01-15 Creation date with +project');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Creation date with');
            expect(todo.projects()).toEqual(['project']);
        });

        test('sample 22: 2025-01-15 Creation date with @context', () => {
            const todo = parseTodo('2025-01-15 Creation date with @context');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Creation date with');
            expect(todo.contexts()).toEqual(['context']);
        });

        test('sample 23: 2025-01-15 Creation date with due:2025-12-31', () => {
            const todo = parseTodo('2025-01-15 Creation date with due:2025-12-31');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Creation date with');
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 24: (A) Task with priority and +project', () => {
            const todo = parseTodo('(A) Task with priority and +project');
            expect(todo.priority()).toBe('A');
            expect(todo.task()).toBe('Task with priority and');
            expect(todo.projects()).toEqual(['project']);
        });

        test('sample 25: (A) Task with priority and @context', () => {
            const todo = parseTodo('(A) Task with priority and @context');
            expect(todo.priority()).toBe('A');
            expect(todo.task()).toBe('Task with priority and');
            expect(todo.contexts()).toEqual(['context']);
        });

        test('sample 26: (A) Task with priority and due:2025-12-31', () => {
            const todo = parseTodo('(A) Task with priority and due:2025-12-31');
            expect(todo.priority()).toBe('A');
            expect(todo.task()).toBe('Task with priority and');
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 27: (A) 2025-01-15 Priority, creation date, and +project', () => {
            const todo = parseTodo('(A) 2025-01-15 Priority, creation date, and +project');
            expect(todo.priority()).toBe('A');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Priority, creation date, and');
            expect(todo.projects()).toEqual(['project']);
        });

        test('sample 28: (A) 2025-01-15 Priority, creation date, and @context', () => {
            const todo = parseTodo('(A) 2025-01-15 Priority, creation date, and @context');
            expect(todo.priority()).toBe('A');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Priority, creation date, and');
            expect(todo.contexts()).toEqual(['context']);
        });

        test('sample 29: (A) 2025-01-15 Priority, creation date, and due:2025-12-31', () => {
            const todo = parseTodo('(A) 2025-01-15 Priority, creation date, and due:2025-12-31');
            expect(todo.priority()).toBe('A');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Priority, creation date, and');
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 30: Task with +project @context', () => {
            const todo = parseTodo('Task with +project @context');
            expect(todo.task()).toBe('Task with');
            expect(todo.projects()).toEqual(['project']);
            expect(todo.contexts()).toEqual(['context']);
        });

        test('sample 31: Task with +project due:2025-12-31', () => {
            const todo = parseTodo('Task with +project due:2025-12-31');
            expect(todo.task()).toBe('Task with');
            expect(todo.projects()).toEqual(['project']);
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 32: Task with @context due:2025-12-31', () => {
            const todo = parseTodo('Task with @context due:2025-12-31');
            expect(todo.task()).toBe('Task with');
            expect(todo.contexts()).toEqual(['context']);
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 33: Task with +project @context due:2025-12-31', () => {
            const todo = parseTodo('Task with +project @context due:2025-12-31');
            expect(todo.task()).toBe('Task with');
            expect(todo.projects()).toEqual(['project']);
            expect(todo.contexts()).toEqual(['context']);
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 34: 2025-01-15 Task with date +project @context', () => {
            const todo = parseTodo('2025-01-15 Task with date +project @context');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Task with date');
            expect(todo.projects()).toEqual(['project']);
            expect(todo.contexts()).toEqual(['context']);
        });

        test('sample 35: 2025-01-15 Task with date +project due:2025-12-31', () => {
            const todo = parseTodo('2025-01-15 Task with date +project due:2025-12-31');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Task with date');
            expect(todo.projects()).toEqual(['project']);
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 36: 2025-01-15 Task with date @context due:2025-12-31', () => {
            const todo = parseTodo('2025-01-15 Task with date @context due:2025-12-31');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Task with date');
            expect(todo.contexts()).toEqual(['context']);
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 37: 2025-01-15 Task with date +project @context due:2025-12-31', () => {
            const todo = parseTodo('2025-01-15 Task with date +project @context due:2025-12-31');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Task with date');
            expect(todo.projects()).toEqual(['project']);
            expect(todo.contexts()).toEqual(['context']);
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 38: (A) Task with priority +project @context', () => {
            const todo = parseTodo('(A) Task with priority +project @context');
            expect(todo.priority()).toBe('A');
            expect(todo.task()).toBe('Task with priority');
            expect(todo.projects()).toEqual(['project']);
            expect(todo.contexts()).toEqual(['context']);
        });

        test('sample 39: (A) Task with priority +project due:2025-12-31', () => {
            const todo = parseTodo('(A) Task with priority +project due:2025-12-31');
            expect(todo.priority()).toBe('A');
            expect(todo.task()).toBe('Task with priority');
            expect(todo.projects()).toEqual(['project']);
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 40: (A) Task with priority @context due:2025-12-31', () => {
            const todo = parseTodo('(A) Task with priority @context due:2025-12-31');
            expect(todo.priority()).toBe('A');
            expect(todo.task()).toBe('Task with priority');
            expect(todo.contexts()).toEqual(['context']);
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 41: (A) Task with priority +project @context due:2025-12-31', () => {
            const todo = parseTodo('(A) Task with priority +project @context due:2025-12-31');
            expect(todo.priority()).toBe('A');
            expect(todo.task()).toBe('Task with priority');
            expect(todo.projects()).toEqual(['project']);
            expect(todo.contexts()).toEqual(['context']);
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 43: (B) 2025-01-14 Different priority and date +project2 @home due:2025-11-30', () => {
            const todo = parseTodo('(B) 2025-01-14 Different priority and date +project2 @home due:2025-11-30');
            expect(todo.priority()).toBe('B');
            expect(todo.creationDate()).toBe('2025-01-14');
            expect(todo.task()).toBe('Different priority and date');
            expect(todo.projects()).toEqual(['project2']);
            expect(todo.contexts()).toEqual(['home']);
            expect(todo.dueDate()).toBe('2025-11-30');
        });

        test('sample 44: (123) 2025-01-13 Numeric priority all params +projectX @work due:2025-10-31', () => {
            const todo = parseTodo('(123) 2025-01-13 Numeric priority all params +projectX @work due:2025-10-31');
            expect(todo.priority()).toBe('123');
            expect(todo.creationDate()).toBe('2025-01-13');
            expect(todo.task()).toBe('Numeric priority all params');
            expect(todo.projects()).toEqual(['projectX']);
            expect(todo.contexts()).toEqual(['work']);
            expect(todo.dueDate()).toBe('2025-10-31');
        });

        test('sample 46: x 2025-01-16 Completed task with completion date', () => {
            const todo = parseTodo('x 2025-01-16 Completed task with completion date');
            expect(todo.isDone()).toBe(true);
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.task()).toBe('Completed task with completion date');
        });

        test('sample 48: x 2025-01-16 Completed task with +project', () => {
            const todo = parseTodo('x 2025-01-16 Completed task with +project');
            expect(todo.isDone()).toBe(true);
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.task()).toBe('Completed task with');
            expect(todo.projects()).toEqual(['project']);
        });

        test('sample 49: x 2025-01-16 Completed task with @context', () => {
            const todo = parseTodo('x 2025-01-16 Completed task with @context');
            expect(todo.isDone()).toBe(true);
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.task()).toBe('Completed task with');
            expect(todo.contexts()).toEqual(['context']);
        });

        test('sample 50: x 2025-01-16 Completed task with due:2025-12-31', () => {
            const todo = parseTodo('x 2025-01-16 Completed task with due:2025-12-31');
            expect(todo.isDone()).toBe(true);
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.task()).toBe('Completed task with');
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 51: x 2025-01-16 2025-01-15 Completed with dates and +project', () => {
            const todo = parseTodo('x 2025-01-16 2025-01-15 Completed with dates and +project');
            expect(todo.isDone()).toBe(true);
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Completed with dates and');
            expect(todo.projects()).toEqual(['project']);
        });

        test('sample 52: x 2025-01-16 2025-01-15 Completed with dates and @context', () => {
            const todo = parseTodo('x 2025-01-16 2025-01-15 Completed with dates and @context');
            expect(todo.isDone()).toBe(true);
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Completed with dates and');
            expect(todo.contexts()).toEqual(['context']);
        });

        test('sample 53: x 2025-01-16 2025-01-15 Completed with dates and due:2025-12-31', () => {
            const todo = parseTodo('x 2025-01-16 2025-01-15 Completed with dates and due:2025-12-31');
            expect(todo.isDone()).toBe(true);
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Completed with dates and');
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 54: x 2025-01-16 Completed with +project @context', () => {
            const todo = parseTodo('x 2025-01-16 Completed with +project @context');
            expect(todo.isDone()).toBe(true);
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.task()).toBe('Completed with');
            expect(todo.projects()).toEqual(['project']);
            expect(todo.contexts()).toEqual(['context']);
        });

        test('sample 55: x 2025-01-16 Completed with +project due:2025-12-31', () => {
            const todo = parseTodo('x 2025-01-16 Completed with +project due:2025-12-31');
            expect(todo.isDone()).toBe(true);
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.task()).toBe('Completed with');
            expect(todo.projects()).toEqual(['project']);
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 56: x 2025-01-16 Completed with @context due:2025-12-31', () => {
            const todo = parseTodo('x 2025-01-16 Completed with @context due:2025-12-31');
            expect(todo.isDone()).toBe(true);
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.task()).toBe('Completed with');
            expect(todo.contexts()).toEqual(['context']);
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 57: x 2025-01-16 Completed with +project @context due:2025-12-31', () => {
            const todo = parseTodo('x 2025-01-16 Completed with +project @context due:2025-12-31');
            expect(todo.isDone()).toBe(true);
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.task()).toBe('Completed with');
            expect(todo.projects()).toEqual(['project']);
            expect(todo.contexts()).toEqual(['context']);
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 59: +project Task starting with project tag', () => {
            const todo = parseTodo('+project Task starting with project tag');
            expect(todo.task()).toBe('Task starting with project tag');
            expect(todo.projects()).toEqual(['project']);
        });

        test('sample 60: @context Task starting with context tag', () => {
            const todo = parseTodo('@context Task starting with context tag');
            expect(todo.task()).toBe('Task starting with context tag');
            expect(todo.contexts()).toEqual(['context']);
        });

        test('sample 61: due:2025-12-31 Task starting with key value', () => {
            const todo = parseTodo('due:2025-12-31 Task starting with key value');
            expect(todo.task()).toBe('Task starting with key value');
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 62: Task with special chars in +project-name @context_name', () => {
            const todo = parseTodo('Task with special chars in +project-name @context_name');
            expect(todo.task()).toBe('Task with special chars in');
            expect(todo.projects()).toEqual(['project-name']);
            expect(todo.contexts()).toEqual(['context_name']);
        });

        test('sample 63: Task with numbers in +project123 @context456', () => {
            const todo = parseTodo('Task with numbers in +project123 @context456');
            expect(todo.task()).toBe('Task with numbers in');
            expect(todo.projects()).toEqual(['project123']);
            expect(todo.contexts()).toEqual(['context456']);
        });

        test('sample 64: Task with dots in +project.name @context.place', () => {
            const todo = parseTodo('Task with dots in +project.name @context.place');
            expect(todo.task()).toBe('Task with dots in');
            expect(todo.projects()).toEqual(['project.name']);
            expect(todo.contexts()).toEqual(['context.place']);
        });

        test('sample 66: (1a) Mixed alphanumeric priority task', () => {
            const todo = parseTodo('(1a) Mixed alphanumeric priority task');
            expect(todo.priority()).toBe('1a');
            expect(todo.task()).toBe('Mixed alphanumeric priority task');
        });

        test('sample 67: (A1) Letter first mixed priority task', () => {
            const todo = parseTodo('(A1) Letter first mixed priority task');
            expect(todo.priority()).toBe('A1');
            expect(todo.task()).toBe('Letter first mixed priority task');
        });

        test('sample 68: "     Task with leading spaces"', () => {
            const todo = parseTodo('     Task with leading spaces');
            expect(todo.task()).toBe('Task with leading spaces');
        });

        test('sample 70: "     (A) 2025-01-15 Task with leading spaces and params     "', () => {
            const todo = parseTodo('     (A) 2025-01-15 Task with leading spaces and params     ');
            expect(todo.priority()).toBe('A');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Task with leading spaces and params');
        });

        test('sample 72: Multiple same contexts @home @home @home', () => {
            const todo = parseTodo('Multiple same contexts @home @home @home');
            expect(todo.task()).toBe('Multiple same contexts');
            expect(todo.contexts()).toEqual(['home', 'home', 'home']);
        });

        test('sample 73: Multiple same projects +projectA +projectA +projectA', () => {
            const todo = parseTodo('Multiple same projects +projectA +projectA +projectA');
            expect(todo.task()).toBe('Multiple same projects');
            expect(todo.projects()).toEqual(['projectA', 'projectA', 'projectA']);
        });

        test('sample 74: rec:+1w Recurrence with plus sign', () => {
            const todo = parseTodo('rec:+1w Recurrence with plus sign');
            expect(todo.task()).toBe('Recurrence with plus sign');
            expect(todo.keyValues()).toEqual({ rec: '+1w' });
        });

        test('sample 75: Custom key custom:value in task', () => {
            const todo = parseTodo('Custom key custom:value in task');
            expect(todo.task()).toBe('Custom key in task');
            expect(todo.keyValues()).toEqual({ custom: 'value' });
        });

        test('sample 77: Task with URL https://example.com/path', () => {
            const todo = parseTodo('Task with URL https://example.com/path');
            expect(todo.task()).toBe('Task with URL');
            expect(todo.keyValues()).toEqual({ 'https': '//example.com/path' });
        });

        test('sample 79: (0) Zero priority task', () => {
            const todo = parseTodo('(0) Zero priority task');
            expect(todo.priority()).toBe('0');
            expect(todo.task()).toBe('Zero priority task');
        });

        test('sample 80: (ABC) Multi-letter priority task', () => {
            const todo = parseTodo('(ABC) Multi-letter priority task');
            expect(todo.priority()).toBe('ABC');
            expect(todo.task()).toBe('Multi-letter priority task');
        });

        test('sample 81: (999999) Very large numeric priority', () => {
            const todo = parseTodo('(999999) Very large numeric priority +project');
            expect(todo.priority()).toBe('999999');
            expect(todo.task()).toBe('Very large numeric priority');
            expect(todo.projects()).toEqual(['project']);
        });

        test('sample 82: Task with unicode émojis 🎯 and special chars', () => {
            const todo = parseTodo('Task with unicode émojis 🎯 and special chars');
            expect(todo.task()).toBe('Task with unicode émojis 🎯 and special chars');
        });

        test('sample 83: @context+project Wrong order but both present', () => {
            const todo = parseTodo('@context+project Wrong order but both present');
            expect(todo.task()).toBe('Wrong order but both present');
            expect(todo.contexts()).toEqual(['context+project']);
        });

        test('sample 84: t:2025-01-15 Short key for date', () => {
            const todo = parseTodo('t:2025-01-15 Short key for date');
            expect(todo.task()).toBe('Short key for date');
            expect(todo.keyValues()).toEqual({ t: '2025-01-15' });
        });

        test('sample 85: p:1 Short key for priority', () => {
            const todo = parseTodo('p:1 Short key for priority');
            expect(todo.task()).toBe('Short key for priority');
            expect(todo.keyValues()).toEqual({ p: '1' });
        });

        test('sample 86: x  2025-01-16 Completed with double space', () => {
            const todo = parseTodo('x  2025-01-16 Completed with double space');
            expect(todo.isDone()).toBe(true);
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.task()).toBe('Completed with double space');
        });

        test('sample 87: x 2025-01-16  2025-01-15 Double space between dates', () => {
            const todo = parseTodo('x 2025-01-16  2025-01-15 Double space between dates');
            expect(todo.isDone()).toBe(true);
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Double space between dates');
        });

        test('sample 88: (A)  2025-01-15 Double space after priority', () => {
            const todo = parseTodo('(A)  2025-01-15 Double space after priority');
            expect(todo.priority()).toBe('A');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Double space after priority');
        });

        test('sample 89: Task with +CamelCaseProject @PascalCaseContext', () => {
            const todo = parseTodo('Task with +CamelCaseProject @PascalCaseContext');
            expect(todo.task()).toBe('Task with');
            expect(todo.projects()).toEqual(['CamelCaseProject']);
            expect(todo.contexts()).toEqual(['PascalCaseContext']);
        });

        test('sample 90: Task with +snake_case_project @kebab-case-context', () => {
            const todo = parseTodo('Task with +snake_case_project @kebab-case-context');
            expect(todo.task()).toBe('Task with');
            expect(todo.projects()).toEqual(['snake_case_project']);
            expect(todo.contexts()).toEqual(['kebab-case-context']);
        });

        test('sample 91: +123project Project starting with numbers', () => {
            const todo = parseTodo('+123project Project starting with numbers');
            expect(todo.task()).toBe('Project starting with numbers');
            expect(todo.projects()).toEqual(['123project']);
        });

        test('sample 92: @123context Context starting with numbers', () => {
            const todo = parseTodo('@123context Context starting with numbers');
            expect(todo.task()).toBe('Context starting with numbers');
            expect(todo.contexts()).toEqual(['123context']);
        });

        test('sample 94: Escaped special chars \\+not-project \\@not-context', () => {
            const todo = parseTodo('Escaped special chars \\+not-project \\@not-context');
            expect(todo.task()).toBe('Escaped special chars \\+not-project \\@not-context');
            expect(todo.projects()).toEqual([]);
            expect(todo.contexts()).toEqual([]);
        });

        test('sample 96: +project@email.com Might confuse parser', () => {
            const todo = parseTodo('+project@email.com Might confuse parser');
            expect(todo.task()).toBe('Might confuse parser');
            expect(todo.projects()).toEqual(['project@email.com']);
        });

        test('sample 97: Task with (parentheses) in description not priority', () => {
            const todo = parseTodo('Task with (parentheses) in description not priority');
            expect(todo.task()).toBe('Task with (parentheses) in description not priority');
            expect(todo.priority()).toBeNull();
        });

        test('sample 98: Task with [brackets] and {braces} in description', () => {
            const todo = parseTodo('Task with [brackets] and {braces} in description');
            expect(todo.task()).toBe('Task with [brackets] and {braces} in description');
        });

        test('sample 99: due:2025-12-31 @context Order matters for key:value', () => {
            const todo = parseTodo('due:2025-12-31 @context Order matters for key:value');
            expect(todo.task()).toBe('Order matters for');
            expect(todo.contexts()).toEqual(['context']);
            expect(todo.keyValues()).toEqual({ due: '2025-12-31', key: 'value' });
        });

        test('sample 100: @context due:2025-12-31 Different order same elements', () => {
            const todo = parseTodo('@context due:2025-12-31 Different order same elements');
            expect(todo.task()).toBe('Different order same elements');
            expect(todo.contexts()).toEqual(['context']);
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 101: Long task description that contains many words and might wrap in some views but should still parse correctly with +project @context due:2025-12-31', () => {
            const todo = parseTodo('Long task description that contains many words and might wrap in some views but should still parse correctly with +project @context due:2025-12-31');
            expect(todo.task()).toBe('Long task description that contains many words and might wrap in some views but should still parse correctly with');
            expect(todo.projects()).toEqual(['project']);
            expect(todo.contexts()).toEqual(['context']);
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 103: Task with emoji context @🏠home @💼work @🛒shopping', () => {
            const todo = parseTodo('Task with emoji context @🏠home @💼work @🛒shopping');
            expect(todo.task()).toBe('Task with emoji context');
            expect(todo.contexts()).toEqual(['🏠home', '💼work', '🛒shopping']);
        });

        test('sample 104: Task with emoji in description 🎉 Complete the feature 🚀 +dev @office', () => {
            const todo = parseTodo('Task with emoji in description 🎉 Complete the feature 🚀 +dev @office');
            expect(todo.task()).toBe('Task with emoji in description 🎉 Complete the feature 🚀');
            expect(todo.projects()).toEqual(['dev']);
            expect(todo.contexts()).toEqual(['office']);
        });

        test('sample 105: (A) 2025-01-15 Priority task with emojis 🔥 +🚀deploy @🏠home due:2025-12-31', () => {
            const todo = parseTodo('(A) 2025-01-15 Priority task with emojis 🔥 +🚀deploy @🏠home due:2025-12-31');
            expect(todo.priority()).toBe('A');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Priority task with emojis 🔥');
            expect(todo.projects()).toEqual(['🚀deploy']);
            expect(todo.contexts()).toEqual(['🏠home']);
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 106: x 2025-01-16 Completed emoji task 🎉 +🚀project @🏠home', () => {
            const todo = parseTodo('x 2025-01-16 Completed emoji task 🎉 +🚀project @🏠home');
            expect(todo.isDone()).toBe(true);
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.task()).toBe('Completed emoji task 🎉');
            expect(todo.projects()).toEqual(['🚀project']);
            expect(todo.contexts()).toEqual(['🏠home']);
        });

        test('sample 107: Mixed emoji and text +emoji🎯project @context🔥fire', () => {
            const todo = parseTodo('Mixed emoji and text +emoji🎯project @context🔥fire');
            expect(todo.task()).toBe('Mixed emoji and text');
            expect(todo.projects()).toEqual(['emoji🎯project']);
            expect(todo.contexts()).toEqual(['context🔥fire']);
        });

        test('sample 108: Multiple emojis in one tag +🚀🎯🔥 @🏠💼🛒', () => {
            const todo = parseTodo('Multiple emojis in one tag +🚀🎯🔥 @🏠💼🛒');
            expect(todo.task()).toBe('Multiple emojis in one tag');
            expect(todo.projects()).toEqual(['🚀🎯🔥']);
            expect(todo.contexts()).toEqual(['🏠💼🛒']);
        });

        test('sample 109: Emoji with skin tone +👋🏻project @👨‍💻dev', () => {
            const todo = parseTodo('Emoji with skin tone +👋🏻project @👨‍💻dev');
            expect(todo.task()).toBe('Emoji with skin tone');
            expect(todo.projects()).toEqual(['👋🏻project']);
            expect(todo.contexts()).toEqual(['👨‍💻dev']);
        });

        test('sample 110: Complex emoji +👨‍👩‍👧‍👦family @🏳️‍🌈pride', () => {
            const todo = parseTodo('Complex emoji +👨‍👩‍👧‍👦family @🏳️‍🌈pride');
            expect(todo.task()).toBe('Complex emoji');
            expect(todo.projects()).toEqual(['👨‍👩‍👧‍👦family']);
            expect(todo.contexts()).toEqual(['🏳️‍🌈pride']);
        });

        test('sample 111: Zero-width joiner emoji +🧑‍🚀astronaut @👨‍⚕️doctor', () => {
            const todo = parseTodo('Zero-width joiner emoji +🧑‍🚀astronaut @👨‍⚕️doctor');
            expect(todo.task()).toBe('Zero-width joiner emoji');
            expect(todo.projects()).toEqual(['🧑‍🚀astronaut']);
            expect(todo.contexts()).toEqual(['👨‍⚕️doctor']);
        });

        test('sample 112: Task with Japanese text タスク +プロジェクト @コンテキスト', () => {
            const todo = parseTodo('Task with Japanese text タスク +プロジェクト @コンテキスト');
            expect(todo.task()).toBe('Task with Japanese text タスク');
            expect(todo.projects()).toEqual(['プロジェクト']);
            expect(todo.contexts()).toEqual(['コンテキスト']);
        });

        test('sample 113: Task with Chinese 任务 +项目 @上下文', () => {
            const todo = parseTodo('Task with Chinese 任务 +项目 @上下文');
            expect(todo.task()).toBe('Task with Chinese 任务');
            expect(todo.projects()).toEqual(['项目']);
            expect(todo.contexts()).toEqual(['上下文']);
        });

        test('sample 114: Task with Korean 작업 +프로젝트 @컨텍스트', () => {
            const todo = parseTodo('Task with Korean 작업 +프로젝트 @컨텍스트');
            expect(todo.task()).toBe('Task with Korean 작업');
            expect(todo.projects()).toEqual(['프로젝트']);
            expect(todo.contexts()).toEqual(['컨텍스트']);
        });

        test('sample 115: Task with Arabic مهمة +مشروع @سياق', () => {
            const todo = parseTodo('Task with Arabic مهمة +مشروع @سياق');
            expect(todo.task()).toBe('Task with Arabic مهمة');
            expect(todo.projects()).toEqual(['مشروع']);
            expect(todo.contexts()).toEqual(['سياق']);
        });

        test('sample 116: Task with Hebrew משימה +פרויקט @הקשר', () => {
            const todo = parseTodo('Task with Hebrew משימה +פרויקט @הקשר');
            expect(todo.task()).toBe('Task with Hebrew משימה');
            expect(todo.projects()).toEqual(['פרויקט']);
            expect(todo.contexts()).toEqual(['הקשר']);
        });

        test('sample 117: Task with Cyrillic задача +проект @контекст', () => {
            const todo = parseTodo('Task with Cyrillic задача +проект @контекст');
            expect(todo.task()).toBe('Task with Cyrillic задача');
            expect(todo.projects()).toEqual(['проект']);
            expect(todo.contexts()).toEqual(['контекст']);
        });

        test('sample 118: Task with mixed scripts +日本語project @中文context', () => {
            const todo = parseTodo('Task with mixed scripts +日本語project @中文context');
            expect(todo.task()).toBe('Task with mixed scripts');
            expect(todo.projects()).toEqual(['日本語project']);
            expect(todo.contexts()).toEqual(['中文context']);
        });

        test('sample 119: RTL text עברית task with +project @context due:2025-12-31', () => {
            const todo = parseTodo('RTL text עברית task with +project @context due:2025-12-31');
            expect(todo.task()).toBe('RTL text עברית task with');
            expect(todo.projects()).toEqual(['project']);
            expect(todo.contexts()).toEqual(['context']);
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 120: Combining marks task̃ +projec̈t @conte͂xt', () => {
            const todo = parseTodo('Combining marks task̃ +projec̈t @conte͂xt');
            expect(todo.task()).toBe('Combining marks task̃');
            expect(todo.projects()).toEqual(['projec̈t']);
            expect(todo.contexts()).toEqual(['conte͂xt']);
        });

        test('sample 121: Task with !@#$%^&*() special chars in description', () => {
            const todo = parseTodo('Task with !@#$%^&*() special chars in description');
            expect(todo.task()).toBe('Task with !@#$%^&*() special chars in description');
        });

        test('sample 122: Task with +project!name @context#tag', () => {
            const todo = parseTodo('Task with +project!name @context#tag');
            expect(todo.task()).toBe('Task with');
            expect(todo.projects()).toEqual(['project!name']);
            expect(todo.contexts()).toEqual(['context#tag']);
        });

        test('sample 123: Task with +pro-ject_name @con.text_name', () => {
            const todo = parseTodo('Task with +pro-ject_name @con.text_name');
            expect(todo.task()).toBe('Task with');
            expect(todo.projects()).toEqual(['pro-ject_name']);
            expect(todo.contexts()).toEqual(['con.text_name']);
        });

        test('sample 124: Task with +project/subproject @context\\subcontext', () => {
            const todo = parseTodo('Task with +project/subproject @context\\subcontext');
            expect(todo.task()).toBe('Task with');
            expect(todo.projects()).toEqual(['project/subproject']);
            expect(todo.contexts()).toEqual(['context\\subcontext']);
        });

        test('sample 125: Task with +project|pipe @context&and', () => {
            const todo = parseTodo('Task with +project|pipe @context&and');
            expect(todo.task()).toBe('Task with');
            expect(todo.projects()).toEqual(['project|pipe']);
            expect(todo.contexts()).toEqual(['context&and']);
        });

        test('sample 126: Task with quotes "quoted +project" and \'single @quotes\'', () => {
            const todo = parseTodo('Task with quotes "quoted +project" and \'single @quotes\'');
            expect(todo.task()).toBe('Task with quotes "quoted and \'single');
            expect(todo.projects()).toEqual(['project"']);
            expect(todo.contexts()).toEqual(['quotes\'']);
        });

        test('sample 127: Task with backticks `code +example` @context', () => {
            const todo = parseTodo('Task with backticks `code +example` @context');
            expect(todo.task()).toBe('Task with backticks `code');
            expect(todo.projects()).toEqual(['example`']);
            expect(todo.contexts()).toEqual(['context']);
        });

        test('sample 128: Task with brackets [not a link] +project', () => {
            const todo = parseTodo('Task with brackets [not a link] +project');
            expect(todo.task()).toBe('Task with brackets [not a link]');
            expect(todo.projects()).toEqual(['project']);
        });

        test('sample 129: Task with angle brackets <not html> @context', () => {
            const todo = parseTodo('Task with angle brackets <not html> @context');
            expect(todo.task()).toBe('Task with angle brackets <not html>');
            expect(todo.contexts()).toEqual(['context']);
        });

        test('sample 130: Task with curly braces {not json} +project', () => {
            const todo = parseTodo('Task with curly braces {not json} +project');
            expect(todo.task()).toBe('Task with curly braces {not json}');
            expect(todo.projects()).toEqual(['project']);
        });

        test('sample 131: Task with backslash\\\\ in middle', () => {
            const todo = parseTodo('Task with backslash\\\\ in middle');
            expect(todo.task()).toBe('Task with backslash\\\\ in middle');
        });

        test('sample 132: Task with zero​width​space between words', () => {
            const todo = parseTodo('Task with zero​width​space between words');
            expect(todo.task()).toBe('Task with zero​width​space between words');
        });

        test('sample 133: Task with soft­hyphen in word', () => {
            const todo = parseTodo('Task with soft­hyphen in word');
            expect(todo.task()).toBe('Task with soft­hyphen in word');
        });

        test('sample 134: (A) 2025-01-15 Task +project1 +project2 +project3 @context1 @context2 @context3 due:2025-12-31 rec:1w pri:H custom:value foo:bar', () => {
            const todo = parseTodo('(A) 2025-01-15 Task +project1 +project2 +project3 @context1 @context2 @context3 due:2025-12-31 rec:1w pri:H custom:value foo:bar');
            expect(todo.priority()).toBe('A');
            expect(todo.creationDate()).toBe('2025-01-15');
            expect(todo.task()).toBe('Task');
            expect(todo.projects()).toEqual(['project1', 'project2', 'project3']);
            expect(todo.contexts()).toEqual(['context1', 'context2', 'context3']);
            expect(todo.keyValues()).toEqual({
                due: '2025-12-31',
                rec: '1w',
                pri: 'H',
                custom: 'value',
                foo: 'bar'
            });
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 136: (123456789) Very long numeric priority +project', () => {
            const todo = parseTodo('(123456789) Very long numeric priority +project');
            expect(todo.priority()).toBe('123456789');
            expect(todo.task()).toBe('Very long numeric priority');
            expect(todo.projects()).toEqual(['project']);
        });

        test('sample 137: (A1B2C3) Complex alphanumeric priority @context', () => {
            const todo = parseTodo('(A1B2C3) Complex alphanumeric priority @context');
            expect(todo.priority()).toBe('A1B2C3');
            expect(todo.task()).toBe('Complex alphanumeric priority');
            expect(todo.contexts()).toEqual(['context']);
        });

        test('sample 138: Multiple dates 2025-01-15 2025-01-16 2025-01-17 in task', () => {
            const todo = parseTodo('Multiple dates 2025-01-15 2025-01-16 2025-01-17 in task');
            expect(todo.creationDate()).toBeNull();
            expect(todo.task()).toBe('Multiple dates 2025-01-15 2025-01-16 2025-01-17 in task');
        });

        test('sample 139: Task with very long project name +ThisIsAVeryLongProjectNameThatMightCauseIssuesWithSomeSystemsThatHaveLengthLimitsOnIdentifiers', () => {
            const todo = parseTodo('Task with very long project name +ThisIsAVeryLongProjectNameThatMightCauseIssuesWithSomeSystemsThatHaveLengthLimitsOnIdentifiers');
            expect(todo.task()).toBe('Task with very long project name');
            expect(todo.projects()).toEqual(['ThisIsAVeryLongProjectNameThatMightCauseIssuesWithSomeSystemsThatHaveLengthLimitsOnIdentifiers']);
        });

        test('sample 143: Extremely long task description that goes on and on and on with many words to test how the parser handles very long lines that might exceed buffer limits in some implementations and includes +project @context due:2025-12-31 and continues even further with more text', () => {
            const todo = parseTodo('Extremely long task description that goes on and on and on with many words to test how the parser handles very long lines that might exceed buffer limits in some implementations and includes +project @context due:2025-12-31 and continues even further with more text');
            expect(todo.task()).toBe('Extremely long task description that goes on and on and on with many words to test how the parser handles very long lines that might exceed buffer limits in some implementations and includes and continues even further with more text');
            expect(todo.projects()).toEqual(['project']);
            expect(todo.contexts()).toEqual(['context']);
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 144: +project Task with only project no description after', () => {
            const todo = parseTodo('+project Task with only project no description after');
            expect(todo.task()).toBe('Task with only project no description after');
            expect(todo.projects()).toEqual(['project']);
        });

        test('sample 145: @context Task with only context no description after', () => {
            const todo = parseTodo('@context Task with only context no description after');
            expect(todo.task()).toBe('Task with only context no description after');
            expect(todo.contexts()).toEqual(['context']);
        });

        test('sample 146: due:2025-12-31 Task with only key:value no description after', () => {
            const todo = parseTodo('due:2025-12-31 Task with only key:value no description after');
            expect(todo.task()).toBe('Task with only no description after');
            expect(todo.keyValues()).toEqual({ due: '2025-12-31', key: 'value' });
            expect(todo.dueDate()).toBe('2025-12-31');
        });

        test('sample 149: x 2025-01-16 Completed with date only no description', () => {
            const todo = parseTodo('x 2025-01-16 Completed with date only no description');
            expect(todo.isDone()).toBe(true);
            expect(todo.completionDate()).toBe('2025-01-16');
            expect(todo.task()).toBe('Completed with date only no description');
        });

        test('sample 151: Task with HTML tags <b>bold</b> text', () => {
            const todo = parseTodo('Task with HTML tags <b>bold</b> text');
            expect(todo.task()).toBe('Task with HTML tags <b>bold</b> text');
        });

        test('sample 152: Task with & HTML entity &amp; test', () => {
            const todo = parseTodo('Task with & HTML entity &amp; test');
            expect(todo.task()).toBe('Task with & HTML entity &amp; test');
        });

        test('sample 153: Task with < and > comparison operators', () => {
            const todo = parseTodo('Task with < and > comparison operators');
            expect(todo.task()).toBe('Task with < and > comparison operators');
        });

        test('sample 154: Task with && and || logical operators', () => {
            const todo = parseTodo('Task with && and || logical operators');
            expect(todo.task()).toBe('Task with && and || logical operators');
        });

        test('sample 155: Task with -> arrow notation', () => {
            const todo = parseTodo('Task with -> arrow notation');
            expect(todo.task()).toBe('Task with -> arrow notation');
        });

        test('sample 156: Task with => fat arrow', () => {
            const todo = parseTodo('Task with => fat arrow');
            expect(todo.task()).toBe('Task with => fat arrow');
        });

        test('sample 157: Task with ... ellipsis', () => {
            const todo = parseTodo('Task with ... ellipsis');
            expect(todo.task()).toBe('Task with ... ellipsis');
        });

        test('sample 158: Task with file.extension.txt mentions', () => {
            const todo = parseTodo('Task with file.extension.txt mentions');
            expect(todo.task()).toBe('Task with file.extension.txt mentions');
        });

        test('sample 159: Task with https://example.com/+project/@context/page', () => {
            const todo = parseTodo('Task with https://example.com/+project/@context/page');
            expect(todo.task()).toBe('Task with');
            expect(todo.keyValues()).toEqual({ 'https': '//example.com/+project/@context/page' });
        });

        test('sample 160: "     Heavily indented task with many spaces"', () => {
            const todo = parseTodo('     Heavily indented task with many spaces');
            expect(todo.task()).toBe('Heavily indented task with many spaces');
        });

        test('sample 161: Task with tab indentation', () => {
            const todo = parseTodo('\t\tTask with tab indentation');
            expect(todo.task()).toBe('Task with tab indentation');
        });

        test('sample 162: Mixed spaces and tabs indentation', () => {
            const todo = parseTodo('\t  \tMixed spaces and tabs indentation');
            expect(todo.task()).toBe('Mixed spaces and tabs indentation');
        });

        test('sample 163: Task with trailing newline', () => {
            const todo = parseTodo('Task with trailing newline');
            expect(todo.task()).toBe('Task with trailing newline');
        });

        test('sample 164: (A) No space after priority works as valid format', () => {
            const todo = parseTodo('(A) No space after priority works as valid format');
            expect(todo.priority()).toBe('A');
            expect(todo.task()).toBe('No space after priority works as valid format');
        });

        test('sample 165: Task without trailing newline', () => {
            const todo = parseTodo('Task without trailing newline');
            expect(todo.task()).toBe('Task without trailing newline');
        });
    });

    describe('Position information tests', () => {
        test('basic position accuracy', () => {
            const line = 'x (A) 2016-05-20 task +project @context due:2025-12-31';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            
            // 各位置情報をチェック
            expect(positions.completion).toEqual({ value: 'x', start: 0, end: 1 });
            expect(positions.priority).toEqual({ value: '(A)', start: 2, end: 5 });
            expect(positions.completionDate).toEqual({ value: '2016-05-20', start: 6, end: 16 }); // 完了タスクで1つの日付は完了日
            expect(positions.creationDate).toBeNull();
            expect(positions.projects).toEqual([{ value: '+project', start: 22, end: 30 }]);
            expect(positions.contexts).toEqual([{ value: '@context', start: 31, end: 39 }]);
            expect(positions.keyValues).toEqual([{ value: 'due:2025-12-31', start: 40, end: 54 }]);
        });

        test('position accuracy with spaces', () => {
            const line = '  x   (A)   2016-05-20   task';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            
            expect(positions.completion).toEqual({ value: 'x', start: 2, end: 3 });
            expect(positions.priority).toEqual({ value: '(A)', start: 6, end: 9 });
            expect(positions.completionDate).toEqual({ value: '2016-05-20', start: 12, end: 22 }); // 完了タスクで1つの日付は完了日
            expect(positions.creationDate).toBeNull();
        });

        test('position accuracy with emojis', () => {
            const line = 'Task with 🚀 emoji +🎯project @🏠home';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            
            // 各要素が元の文字列から正確に抽出できることを確認
            positions.projects.forEach(project => {
                const extractedValue = line.substring(project.start, project.end);
                expect(extractedValue).toBe(project.value);
            });
            
            positions.contexts.forEach(context => {
                const extractedValue = line.substring(context.start, context.end);
                expect(extractedValue).toBe(context.value);
            });
        });

        test('position accuracy complex example', () => {
            const line = '(A) 2025-01-15 Complex task +project1 +project2 @context1 @context2 due:2025-12-31 rec:1w';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            
            // すべての要素の位置情報が正確であることを確認
            if (positions.priority) {
                const extractedValue = line.substring(positions.priority.start, positions.priority.end);
                expect(extractedValue).toBe(positions.priority.value);
            }
            
            if (positions.creationDate) {
                const extractedValue = line.substring(positions.creationDate.start, positions.creationDate.end);
                expect(extractedValue).toBe(positions.creationDate.value);
            }
            
            positions.projects.forEach(project => {
                const extractedValue = line.substring(project.start, project.end);
                expect(extractedValue).toBe(project.value);
            });
            
            positions.contexts.forEach(context => {
                const extractedValue = line.substring(context.start, context.end);
                expect(extractedValue).toBe(context.value);
            });
            
            positions.keyValues.forEach(keyValue => {
                const extractedValue = line.substring(keyValue.start, keyValue.end);
                expect(extractedValue).toBe(keyValue.value);
            });
        });

        test('completed task with completion date position', () => {
            const line = 'x 2025-01-16 2025-01-15 Completed task';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            
            expect(positions.completion).toEqual({ value: 'x', start: 0, end: 1 });
            expect(positions.completionDate).toEqual({ value: '2025-01-16', start: 2, end: 12 });
            expect(positions.creationDate).toEqual({ value: '2025-01-15', start: 13, end: 23 });
        });
        
        test('completed task with single date (completion date)', () => {
            const line = 'x 2025-01-15 Single date completed task';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            
            expect(positions.completion).toEqual({ value: 'x', start: 0, end: 1 });
            expect(positions.completionDate).toEqual({ value: '2025-01-15', start: 2, end: 12 }); // 完了タスクで1つの日付は完了日
            expect(positions.creationDate).toBeNull();
        });

        test('position information should be null for missing elements', () => {
            const line = 'Simple task without any parameters';
            const todo = parseTodo(line);
            const positions = todo.getElementPositions();
            
            expect(positions.completion).toBeNull();
            expect(positions.priority).toBeNull();
            expect(positions.creationDate).toBeNull();
            expect(positions.completionDate).toBeNull();
            expect(positions.projects).toEqual([]);
            expect(positions.contexts).toEqual([]);
            expect(positions.keyValues).toEqual([]);
        });
    });
});
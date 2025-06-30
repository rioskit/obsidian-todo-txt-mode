# Todo.txt Mode for Obsidian

Todo.txt Mode is an Obsidian plugin that provides support for the [todo.txt](https://github.com/todotxt/todo.txt) file format in [Obsidian](https://obsidian.md).

[![Image from Gyazo](https://i.gyazo.com/e0e9a7ecb8a9f5fc050c85bbe544c963.png)](https://gyazo.com/e0e9a7ecb8a9f5fc050c85bbe544c963)

## Features

- **Syntax Highlight**:
  - Automatic highlighting for todo.txt elements
    - Completed tasks, project tags (`+project`), context tags (`@context`), priority markers (`(A)`, `(B)`), due dates (`due:yyyy-mm-dd`), recurring task markers (`rec:d`, `rec:w`, `rec:m`, `rec:y`)
  - Customize colors with the [Style Settings Plugin](https://github.com/mgmeyers/obsidian-style-settings)

- **Automatic Completion Date**: 
  - Automatically adds completion date when marking tasks as complete with `x `

- **Recurring tasks**:
  - Automatic recurring task generation using `rec:`
    - attribute Intervals: `d` (daily), `b` (business days), `w` (weekly), `m` (monthly), `y` (yearly)
  -  Numeric prefixes: `rec:3m` (every 3 months)
  - Strict mode: `rec:+m` (based on original due date)

- **Task Management**: 
  - Move completed tasks to done file
    - `Todo.txt: Move completed tasks to done file`

- ***Task Sorting***:
  - Sort by priority, project, context, due date
    - `Todo.txt: Sort by priority/project/context/due date`




## About todo.txt format

Basic todo.txt format:

```
x 2023-05-08 Completed task +project @context
Today's task +work @office
(A) High priority task +project
A task with due:2023-05-15 date
Daily standup @work rec:d due:2023-05-08
Monthly review +personal rec:+m due:2023-05-01
Submit report @work rec:3b due:2023-05-12
```

Visit the [official website](https://github.com/todotxt/todo.txt) for more details.

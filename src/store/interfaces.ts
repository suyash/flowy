export interface Task {
    id: string;
    text: string;
    checked: boolean;
    children: string[];
}

export interface TaskStore {
    create(parent: Task, text?: string): Promise<Task>;
    createBefore(parent: Task, nextSibling: Task, text?: string): Promise<Task>;
    task(id: string): Promise<Task>;
    update(task: Task): Promise<void>;
    remove(task: Task): Promise<void>;
    initialize(): Promise<Task>;
}

export function uuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (): string => {
        return Math.floor(Math.random() * 16).toString(16);
    });
}

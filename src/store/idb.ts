import { set, Store } from "idb-keyval";

import { Task, uuid } from "./interfaces";

const tasksStore: Store = new Store("taskflowy", "tasks");

export async function initialize(): Promise<Task> {
    const root: Task = { id: "root", text: " ", checked: false, children: [] };
    await set("root", root, tasksStore);
    await create("first item", root);
    return root;
}

export async function create(text: string, parent: Task): Promise<Task> {
    const id: string = uuid();
    const task: Task = { id, text, checked: false, children: [] };

    parent.children.push(id);

    await Promise.all([
        set(parent.id, parent, tasksStore),
        set(id, task, tasksStore),
    ]);

    return task;
}

export async function createBefore(text: string, sibling: Task, parent: Task): Promise<Task> {
    const id: string = uuid();
    const task: Task = { id, text, checked: false, children: [] };

    const index: number = parent.children.indexOf(sibling.id);

    parent.children.splice(index, 0, id);

    await Promise.all([
        set(parent.id, parent, tasksStore),
        set(id, task, tasksStore),
    ]);

    return task;
}

export default tasksStore;

import { set, Store } from "idb-keyval";

import { Task, uuid } from "./interfaces";

const store: Store = new Store("taskflowy", "tasks");

export async function initialize(): Promise<Task> {
    const root: Task = { id: "root", text: " ", checked: false, children: [] };
    await set("root", root, store);
    await create("first item", root);
    return root;
}

export async function create(text: string, parent: Task): Promise<Task> {
    const id: string = uuid();
    const task: Task = { id, text, checked: false, children: [] };

    parent.children.push(id);

    await Promise.all([
        set(parent.id, parent, store),
        set(id, task, store),
    ]);

    return task;
}

export default store;

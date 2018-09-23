import { set, Store } from "idb-keyval";

import { Task } from "./store";

const store: Store = new Store("taskflowy", "tasks");

export async function initialize(): Promise<Task> {
    const root: Task = { id: "root", text: " ", children: [] };
    await set("root", root, store);
    await save("first item", root);
    return root;
}

export async function save(text: string, parent: Task): Promise<Task> {
    const id: string = Math.random().toString().slice(2);
    const task: Task = { id, text, children: [] };

    parent.children.push(id);

    await Promise.all([
        set(parent.id, parent, store),
        set(id, task, store),
    ]);

    return task;
}

export default store;

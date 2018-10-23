import { del, get, keys, set, Store } from "idb-keyval";

import { Task, TaskStore, uuid } from "./interfaces";

interface IDBTaskStore extends TaskStore {
    store: Store;
}

const taskStore: IDBTaskStore = {
    store: new Store("taskflowy", "tasks"),

    task(id: string): Promise<Task> {
        return get(id, this.store) as Promise<Task>;
    },

    async create(parent: Task, text: string = ""): Promise<Task> {
        const id: string = uuid();
        const task: Task = { id, text, checked: false, pinned: false, collapsed: false, children: [] };

        parent.children.push(id);

        await Promise.all([
            set(parent.id, parent, this.store),
            set(id, task, this.store),
        ]);

        return task;
    },

    async createBefore(parent: Task, nextSibling: Task, text: string = ""): Promise<Task> {
        const id: string = uuid();
        const task: Task = { id, text, checked: false, pinned: false, collapsed: false, children: [] };

        const index: number = parent.children.indexOf(nextSibling.id);

        parent.children.splice(index, 0, id);

        await Promise.all([
            set(parent.id, parent, this.store),
            set(id, task, this.store),
        ]);

        return task;
    },

    update(task: Task): Promise<void> {
        return set(task.id, task, this.store);
    },

    remove(task: Task): Promise<void> {
        return del(task.id);
    },

    async initialize(): Promise<Task> {
        const root: Task = { id: "root", text: " ", checked: false, pinned: false, collapsed: false, children: [] };
        await set("root", root, this.store);
        await this.create(root, "first item");
        return root;
    },
};

export async function clear(): Promise<void> {
    const ids: string[] = await keys(taskStore.store) as string[];
    await Promise.all(ids.map((id: string): Promise<void> => del(id, taskStore.store)));
}

export default taskStore;

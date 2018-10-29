import { del, get, keys, set, Store } from "idb-keyval";

import { Task, TaskStore, uuid } from "./interfaces";

interface IDBTaskStore extends TaskStore {
    store: Store;
}

const taskStore: IDBTaskStore = {
    store: new Store("flowy", "tasks"),

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

        await this.create(root, "This is flowy, a small WorkFlowy clone");
        const l1: Task = await this.create(root, "It allows you to organize your life into lists");

        const l2: Task = await this.create(l1, "Lists can have sublists");

        await this.create(l2, "and they can have sublists");
        const l3: Task = await this.create(l2, "Once an item is finished, it can be marked completed");
        l3.checked = true;
        await this.update(l3);
        const l4: Task = await this.create(l2, "Important Nested items can be pinned on top for direct attention");
        l4.pinned = true;
        await this.update(l4);

        // tslint:disable-next-line:max-line-length
        await this.create(root, "It works out of the box in the browser, and optionally allows you to plug in a storage server to back tasks up.");
        await this.create(root, "It also works offline.");
        await this.create(root, "For more details on different features, open the hamburger menu on the top left.");
        await this.create(root, "The app is open source at https://github.com/suyash/flowy, file any issues there.");

        return root;
    },
};

export async function clear(): Promise<void> {
    const ids: string[] = await keys(taskStore.store) as string[];
    await Promise.all(ids.map((id: string): Promise<void> => del(id, taskStore.store)));
}

export default taskStore;

import TaskElement from "../components/task/task";
import idbTaskStore, { clear } from "./idb";
import { Task, TaskStore } from "./interfaces";

export interface CombinedTaskStore extends TaskStore {
    url: string|null;
    apiKey: string|null;
    resyncLocal(url: string, apiKey: string): Promise<void>;
    resyncRemote(url: string, apiKey: string): Promise<void>;
}

interface CombinedPrivateTaskStore extends CombinedTaskStore {
    _updateLocal(task: Task): Promise<void>;
    _updateRemoteSingle(task: Task): Promise<void>;
    _updateRemote(task: Task): Promise<void>;
}

const store: CombinedPrivateTaskStore = {
    apiKey: null,
    url: null,

    async create(parent: Task, text?: string): Promise<Task> {
        return await idbTaskStore.create(parent, text);
    },

    async createBefore(parent: Task, nextSibling: Task, text?: string): Promise<Task> {
        return await idbTaskStore.createBefore(parent, nextSibling, text);
    },

    async task(id: string): Promise<Task> {
        return await idbTaskStore.task(id);
    },

    async update(task: Task): Promise<void> {
        await idbTaskStore.update(task);
        if (!this.url) {
            return;
        }

        await this._updateRemoteSingle(task);
    },

    async _updateRemoteSingle(task: Task): Promise<void> {
        // NOTE: querySelector was broken here for some specific ids, figure out why
        const item: TaskElement = document.getElementById(task.id) as TaskElement;
        item.unsynced = true;

        try {
            await fetch(`${this.url}/set`, {
                body: JSON.stringify(task),
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": this.apiKey as string,
                },
                method: "POST",
            });

            item.unsynced = false;
        } catch (err) {
            // tslint:disable-next-line:no-console
            console.error(err);
        }
    },

    async remove(task: Task): Promise<void> {
        await idbTaskStore.remove(task);
        if (!this.url) {
            return;
        }

        const item: TaskElement = document.getElementById(task.id) as TaskElement;
        if (item) {
            item.unsynced = true;
        }

        try {
            await fetch(`${this.url}/${task.id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": this.apiKey as string,
                },
                method: "DELETE",
            });

            if (item) {
                item.unsynced = false;
            }
        } catch (err) {
            // tslint:disable-next-line:no-console
            console.error(err);
        }
    },

    async initialize(): Promise<Task> {
        return await idbTaskStore.initialize();
    },

    async resyncLocal(url: string, apiKey: string): Promise<void> {
        this.url = url;
        this.apiKey = apiKey;
        updateSyncCredentials(url, apiKey);

        try {
            const resRoot: Response = await fetch(`${this.url}/root`, {
                headers: {
                    "Accept": "application/json",
                    "X-API-Key": this.apiKey as string,
                },
            });

            const root: Task = await resRoot.json();

            if (!root || !root.children || !root.children.length) {
                return;
            }

            await clear();
            await this._updateLocal(root);
        } catch (err) {
            // tslint:disable-next-line:no-console
            console.error(err);
        }
    },

    async _updateLocal(task: Task): Promise<void> {
        if (!task.children) {
            task.children = [];
        }

        idbTaskStore.update(task);

        await Promise.all(task.children.map(async (id: string): Promise<void> => {
            const res: Response = await fetch(`${this.url}/${id}`, {
                headers: {
                    "Accept": "application/json",
                    "X-API-Key": this.apiKey as string,
                },
            });

            const childTask: Task = await res.json();
            await this._updateLocal(childTask);
        }));
    },

    async resyncRemote(url: string, apiKey: string): Promise<void> {
        this.url = url;
        this.apiKey = apiKey;
        updateSyncCredentials(url, apiKey);

        const task: Task = await idbTaskStore.task("root");
        await this._updateRemote(task);
    },

    async _updateRemote(task: Task): Promise<void> {
        await this._updateRemoteSingle(task);
        await Promise.all(task.children.map(async (id: string): Promise<void> => {
            await this._updateRemote(await idbTaskStore.task(id));
        }));
    },
};

function updateSyncCredentials(url: string, apiKey: string): void {
    window.localStorage.setItem("url", url);
    window.localStorage.setItem("apiKey", apiKey);

    (document.querySelector("#status") as HTMLElement).classList.remove("hidden");
    (document.querySelector("#status a") as HTMLAnchorElement).innerText = url;
    (document.querySelector("#status a") as HTMLAnchorElement).href = url;
}

store.url = window.localStorage.getItem("url");
store.apiKey = window.localStorage.getItem("apiKey");

if (store.url && store.apiKey) {
    updateSyncCredentials(store.url, store.apiKey);
}

export default store;

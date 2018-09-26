import { del as removeIDB, get as getIDB, set as setIDB } from "idb-keyval";

import tasksStore, { create as createIDB, createBefore as createBeforeIDB } from "./idb";
import { Task } from "./interfaces";

export async function set(key: string, value: Task): Promise<void> {
    return setIDB(key, value, tasksStore);
}

export async function get(key: string): Promise<Task> {
    return getIDB(key, tasksStore) as Promise<Task>;
}

export async function create(task: string, parent: Task): Promise<Task> {
    return createIDB(task, parent);
}

export async function createBefore(task: string, sibling: Task, parent: Task): Promise<Task> {
    return createBeforeIDB(task, sibling, parent);
}

export async function remove(key: string): Promise<void> {
    return removeIDB(key, tasksStore);
}

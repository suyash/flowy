import { del as removeIDB, get as getIDB, set as setIDB } from "idb-keyval";

import store, { create as createIDB } from "./idb";
import { Task } from "./interfaces";

export async function set(key: string, value: Task): Promise<void> {
    return setIDB(key, value, store);
}

export async function get(key: string): Promise<Task> {
    return getIDB(key, store) as Promise<Task>;
}

export async function create(task: string, parent: Task): Promise<Task> {
    return createIDB(task, parent);
}

export async function remove(key: string): Promise<void> {
    return removeIDB(key, store);
}

import "./main.scss";

import "@webcomponents/custom-elements";
import { get } from "idb-keyval";

import TaskElement from "./components/task/task";
import store, { initialize } from "./store/idb";
import { Task } from "./store/store";

window.addEventListener("DOMContentLoaded", main);

async function main(): Promise<void> {
    const root: Task = await get("root", store) as Task;

    if (!root) {
        await initialize();
    }

    const rootElement: TaskElement = await createElement("root");
    rootElement.setAttribute("root", "true");
    (document.querySelector("main") as HTMLElement).appendChild(rootElement);
}

async function createElement(id: string): Promise<TaskElement> {
    const task: Task = await get(id, store) as Task;
    const element: TaskElement = new TaskElement(task.id, task.text);

    const items: TaskElement[] = await Promise.all(
        task.children.map((cid: string): Promise<TaskElement> => createElement(cid)),
    );

    for (const item of items) {
        element.addSubtask(item);
    }

    return element;
}

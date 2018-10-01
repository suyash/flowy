import TaskElement from "./components/task/task";
import { allowRooting, setRoot } from "./root";
import { Task } from "./store/interfaces";
import store from "./store/store";

export default async function main(): Promise<void> {
    const root: Task = await store.task("root") as Task;

    if (!root) {
        await store.initialize();
    }

    const rootElement: TaskElement = await createElement("root");
    rootElement.root = true;
    rootElement.freezeText();
    setRoot(rootElement);

    (document.querySelector("main") as HTMLElement).appendChild(rootElement);
}

async function createElement(id: string): Promise<TaskElement> {
    const task: Task = await store.task(id) as Task;
    const element: TaskElement = new TaskElement(task);

    const collapsed: boolean = task.collapsed;

    allowRooting(element);

    const items: TaskElement[] = await Promise.all(
        task.children.map((cid: string): Promise<TaskElement> => createElement(cid)),
    );

    for (const item of items) {
        element.addSubtask(item);
    }

    if (collapsed) {
        element.removeAttribute("expanded");
    }

    return element;
}

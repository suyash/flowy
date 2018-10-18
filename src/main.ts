import TaskElement from "./components/task/task";
import { allowRooting, init as initRoot } from "./root";
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
    initRoot(rootElement);

    (document.querySelector("#work") as HTMLElement).appendChild(rootElement);

    for (const el of (document.querySelectorAll("aside a") as any)) {
        el.addEventListener("click", onInfoLinkClick);
    }
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

function onInfoLinkClick(this: HTMLAnchorElement, e: MouseEvent): void {
    e.preventDefault();

    const parent: HTMLElement = this.parentElement as HTMLElement;
    if (parent.hasAttribute("data-open")) {
        parent.removeAttribute("data-open");
    } else {
        parent.setAttribute("data-open", "true");
    }
}

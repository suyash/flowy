import TaskElement from "./components/task/task";
import { init as initRoot } from "./root";
import { Task } from "./store/interfaces";
import store from "./store/store";

export default async function main(): Promise<void> {
    const root: Task = await store.task("root") as Task;

    if (!root) {
        await store.initialize();
    }

    let rootElement: TaskElement = await createElement("root");
    reroot(rootElement);

    (document.querySelector("aside > a") as HTMLAnchorElement).addEventListener("click", onInfoLinkClick);
    (document.querySelector("#storage a") as HTMLAnchorElement).addEventListener("click", onInfoLinkClick);
    (document.querySelector("#shortcuts a") as HTMLAnchorElement).addEventListener("click", onInfoLinkClick);
    (document.querySelector("#about a") as HTMLAnchorElement).addEventListener("click", onInfoLinkClick);

    const storageForm: HTMLFormElement = document.querySelector("#storage form") as HTMLFormElement;
    storageForm.addEventListener("submit", async (e: Event): Promise<void> => {
        e.preventDefault();

        const url: string = (storageForm[0] as HTMLInputElement).value;
        const apiKey: string = (storageForm[1] as HTMLInputElement).value;
        // const resyncRemote: boolean = (storageForm[2] as HTMLInputElement).checked;
        const resyncLocal: boolean = (storageForm[3] as HTMLInputElement).checked;

        if (resyncLocal) {
            await store.resyncLocal(url, apiKey);
            rootElement.remove();
            rootElement = await createElement("root");
            reroot(rootElement);
        } else {
            await store.resyncRemote(url, apiKey);
        }

        (document.querySelector("aside") as HTMLElement).removeAttribute("data-open");
    });
}

function reroot(root: TaskElement): void {
    root.root = true;
    root.freezeText();
    initRoot(root);
    (document.querySelector("#work") as HTMLElement).appendChild(root);
}

async function createElement(id: string): Promise<TaskElement> {
    const task: Task = await store.task(id) as Task;
    const element: TaskElement = new TaskElement(task);

    const collapsed: boolean = task.collapsed;

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

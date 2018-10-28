import TaskElement from "./components/task/task";

let root: TaskElement;
let nav: HTMLElement;

function createNavLink(task: TaskElement): HTMLAnchorElement {
    const a: HTMLAnchorElement = document.createElement("a");

    if (task.id === "root") {
        a.innerText = "🏠";
    } else {
        a.innerText = task.textElement.innerText;
    }

    a.href = "#";
    a.setAttribute("data-task-id", task.id);
    a.addEventListener("click", onNavigationLinkClick);
    return a;
}

function onNavigationLinkClick(e: MouseEvent): void {
    e.preventDefault();

    const id: string = (e.target as HTMLElement).getAttribute("data-task-id") as string;
    while (root.id !== id) {
        const parent: TaskElement|null = root.parent();
        if (!parent) {
            break;
        }

        parent.ancestor = false;
        root.root = false;
        parent.root = true;
        root = parent;

        const a: HTMLAnchorElement|null = nav.querySelector("a:last-child");
        if (a) {
            a.remove();
        }
    }
}

export function makeRoot(task: TaskElement): void {
    const links: HTMLAnchorElement[] = [];

    for (let p: TaskElement = task.parent() as TaskElement ; p !== root ; p = p.parent() as TaskElement) {
        links.push(createNavLink(p));
        p.ancestor = true;
    }

    links.push(createNavLink(root));

    for (const l of links.reverse()) {
        nav.appendChild(l);
    }

    root.ancestor = true;
    root.root = false;

    task.root = true;
    root = task;
}

export function init(task: TaskElement): void {
    root = task;
    nav = document.querySelector("nav") as HTMLElement;
}

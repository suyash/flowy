import TaskElement from "./components/task/task";

let root: TaskElement;
let nav: HTMLElement;

export function allowRooting(task: TaskElement): void {
    let timeout: NodeJS.Timer;
    let hasClick: boolean = false;
    task.textElement.addEventListener("click", (): void => {
        if (!hasClick) {
            hasClick = true;
            timeout = setTimeout(() => {
                hasClick = false;
            }, 200);
        } else {
            clearTimeout(timeout);
            hasClick = false;
            onDoubleClick(task);
        }
    });
}

function createNavLink(task: TaskElement): HTMLAnchorElement {
    const a: HTMLAnchorElement = document.createElement("a");

    if (task.id === "root") {
        a.innerText = "🏠";
    } else {
        a.innerText = task.textElement.innerText;
    }

    a.href = "#";
    return a;
}

function onDoubleClick(task: TaskElement): void {
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

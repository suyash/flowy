import TaskElement from "./components/task/task";

let root: TaskElement;

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

function onDoubleClick(task: TaskElement): void {
    for (let p: TaskElement = task.parent() as TaskElement ; p !== root ; p = p.parent() as TaskElement) {
        p.ancestor = true;
    }

    root.ancestor = true;
    root.root = false;

    task.root = true;
    root = task;
}

export function setRoot(task: TaskElement): void {
    root = task;
}

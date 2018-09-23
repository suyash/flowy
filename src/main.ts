import "./main.scss";

import "@webcomponents/custom-elements";

import Task from "./task/task";

window.addEventListener("DOMContentLoaded", main);

function main(): void {
    const root: Task = new Task("asdasd", "asdasd");

    root.addSubtask(new Task("gsdf", "adasd"));
    root.addSubtask(new Task("agfdg", "easrawsrf"));
    root.addSubtask(new Task("asde", "hxgffg"));

    (document.querySelector("main") as HTMLElement).appendChild(root);
}

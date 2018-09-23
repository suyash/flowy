import Checkbox from "../checkbox/checkbox";

export default class Task extends HTMLElement {
    private subtasks: HTMLElement;
    private node: DocumentFragment;

    constructor(id: string, text: string = "") {
        super();

        const template: HTMLTemplateElement = document.querySelector("#task") as HTMLTemplateElement;
        this.node = document.importNode(template.content, true);
        this.appendChild(this.node);

        this.subtasks = this.querySelector("footer") as HTMLElement;

        const checkbox: Checkbox = new Checkbox(id);
        const tasktext: HTMLSpanElement = document.createElement("span");

        if (text) {
            tasktext.innerHTML = text;
        }

        tasktext.setAttribute("contenteditable", "true");

        const header: HTMLElement = this.querySelector("header") as HTMLElement;
        header.appendChild(checkbox);
        header.appendChild(tasktext);

        (this.querySelector("header > a") as HTMLElement).addEventListener("click", this.toggleExpanded);
    }

    public addSubtask(task: Task): void {
        task.remove();
        this.subtasks.appendChild(task);

        this.setAttribute("has-subtasks", "true");
        this.setAttribute("expanded", "true");
    }

    private toggleExpanded = (e: Event): void => {
        e.preventDefault();
        if (this.hasAttribute("expanded")) {
            this.removeAttribute("expanded");
        } else {
            this.setAttribute("expanded", "true");
        }
    }
}

window.customElements.define("x-task", Task);

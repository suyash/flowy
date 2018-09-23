import { Task as TaskTemplate } from "../../store/interfaces";
import { create, set } from "../../store/store";
import Checkbox from "../checkbox/checkbox";

export default class Task extends HTMLElement {
    private task: TaskTemplate;
    private tasktext: HTMLSpanElement;
    private subtasks: HTMLElement;
    private node: DocumentFragment;

    constructor(task: TaskTemplate) {
        super();

        this.task = task;

        const template: HTMLTemplateElement = document.querySelector("#task") as HTMLTemplateElement;
        this.node = document.importNode(template.content, true);
        this.appendChild(this.node);

        this.id = task.id;

        this.subtasks = this.querySelector("footer") as HTMLElement;

        const checkbox: Checkbox = new Checkbox(task.id);
        this.tasktext = document.createElement("span");

        if (task.text) {
            this.tasktext.innerHTML = task.text;
        }

        this.tasktext.setAttribute("contenteditable", "true");

        const header: HTMLElement = this.querySelector("header") as HTMLElement;
        header.appendChild(checkbox);
        header.appendChild(this.tasktext);

        (this.querySelector("header > a") as HTMLElement).addEventListener("click", this.toggleExpanded);
        this.tasktext.addEventListener("keypress", this.onTextChange);
        this.tasktext.addEventListener("blur", this.onBlur);
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

    private onTextChange = (e: KeyboardEvent): void => {
        /* 13 => enter, 9 => tab */
        if (e.keyCode === 13 || e.keyCode === 9) {
            e.preventDefault();

            switch (e.keyCode) {
            case 13:
                this.addSibling();
                break;
            case 9:
                this.shift();
                break;
            }
        }
    }

    private addSibling = async (): Promise<void> => {
        const parent: Task = (this.parentElement as Task).parentElement as Task;

        const newTask: TaskTemplate = await create("", parent.task);
        const newTaskElement: Task = new Task(newTask);
        parent.addSubtask(newTaskElement);

        (newTaskElement.querySelector("span") as HTMLElement).focus();
    }

    private shift = async (): Promise<void> => {
        const prevSibling: Task = this.previousSibling as Task;
        if (!prevSibling) {
            return;
        }

        const parent: Task = (this.parentElement as Task).parentElement as Task;
        parent.task.children = parent.task.children.filter((id: string): boolean => id !== this.task.id);
        await set(parent.task.id, parent.task);

        prevSibling.task.children.push(this.task.id);
        await set(prevSibling.task.id, prevSibling.task);

        prevSibling.addSubtask(this);
    }

    private onBlur = async (): Promise<void> => {
        this.task.text = this.tasktext.innerHTML;
        await set(this.task.id, this.task);
    }
}

window.customElements.define("x-task", Task);

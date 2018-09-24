import { Task as TaskTemplate } from "../../store/interfaces";
import { create, remove, set } from "../../store/store";
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

        const checkbox: Checkbox = new Checkbox(task.id, task.checked);
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

        checkbox.addEventListener("change", this.onStatusChange);
    }

    public addSubtask(task: Task): void {
        task.remove();
        this.subtasks.appendChild(task);

        this.setAttribute("expanded", "true");
        this.setAttribute("has-subtasks", "true");
    }

    public freezeText(): void {
        this.tasktext.removeAttribute("contenteditable");
    }

    private addSubtaskBefore = (task: Task, nextSibling: Task): void => {
        this.setAttribute("expanded", "true");

        task.remove();
        this.subtasks.insertBefore(task, nextSibling);
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

            if (e.shiftKey) {
                switch (e.keyCode) {
                case 9:
                    this.unshift();
                    break;
                }

                return;
            }

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

    private parent = (): Task => {
        return (this.parentElement as HTMLElement).parentElement as Task;
    }

    private removeSubtask = async (id: string): Promise<void> => {
        this.task.children = this.task.children.filter((cid: string): boolean => cid !== id);
        if (this.task.children.length === 0) {
            this.removeAttribute("has-subtasks");
            this.removeAttribute("expanded");
        }

        await set(this.task.id, this.task);
    }

    private addSibling = async (): Promise<void> => {
        if (this.hasAttribute("root")) {
            return;
        }

        const parent: Task = this.parent();

        const newTask: TaskTemplate = await create("", parent.task);
        const newTaskElement: Task = new Task(newTask);
        parent.addSubtask(newTaskElement);

        (newTaskElement.querySelector("span") as HTMLElement).focus();
    }

    private shift = async (): Promise<void> => {
        if (this.hasAttribute("root")) {
            return;
        }

        const prevSibling: Task = this.previousSibling as Task;
        if (!prevSibling) {
            return;
        }

        const parent: Task = this.parent();
        parent.removeSubtask(this.task.id);

        prevSibling.task.children.push(this.task.id);
        await set(prevSibling.task.id, prevSibling.task);

        prevSibling.addSubtask(this);
    }

    private unshift = async (): Promise<void> => {
        if (this.hasAttribute("root")) {
            return;
        }

        const parent: Task = this.parent();
        const grandParent: Task = parent.parent();
        if (!grandParent) {
            return;
        }

        const nextSibling: Task = parent.nextSibling as Task;

        if (!nextSibling) {
            grandParent.task.children.push(this.id);
            grandParent.addSubtask(this);
        } else {
            const idx: number = grandParent.task.children.indexOf(nextSibling.id);
            grandParent.task.children.splice(idx, 0, this.id);
            grandParent.addSubtaskBefore(this, nextSibling);
        }

        await Promise.all([
            parent.removeSubtask(this.task.id),
            set(grandParent.task.id, grandParent.task),
        ]);
    }

    private onBlur = async (): Promise<void> => {
        this.task.text = this.tasktext.innerHTML;
        if (this.task.text) {
            await set(this.task.id, this.task);
        } else {
            const parent: Task = this.parent();
            this.remove();

            await Promise.all([
                parent.removeSubtask(this.id),
                remove(this.id),
            ]);
        }
    }

    private onStatusChange = async (e: Event): Promise<void> => {
        this.task.checked = (e.target as HTMLInputElement).checked;
        await set(this.task.id, this.task);
    }
}

window.customElements.define("x-task", Task);

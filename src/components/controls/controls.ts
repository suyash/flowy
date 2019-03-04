import Checkbox from "../checkbox/checkbox";
import Task from "../task/task";

/**
 * The <x-controls> element is created once per app and provided to all
 * the tasks.
 *
 * The tasks can call methods on the controls element to
 * - enable/disable controls
 * - set themselves as the active task
 *
 * On user interaction, the controls element will invoke methods on the
 * currently active task.
 */
export default class Controls extends HTMLElement {
    private currentTask: Task|null;
    private indent: HTMLElement;
    private outdent: HTMLElement;
    private toggleCheck: HTMLElement;
    private toggleCheckCheckbox: Checkbox;

    constructor() {
        super();

        this.toggleCheckCheckbox = new Checkbox("toggle-check-control");

        const template: HTMLTemplateElement = document.querySelector("#controls") as HTMLTemplateElement;
        const node: DocumentFragment = document.importNode(template.content, true);

        (node.querySelector("#toggleCheck") as HTMLAnchorElement).appendChild(this.toggleCheckCheckbox);

        this.appendChild(node);

        this.indent = this.querySelector("#indent") as HTMLElement;
        this.outdent = this.querySelector("#outdent") as HTMLElement;
        this.toggleCheck = this.querySelector("#toggleCheck") as HTMLElement;

        this.currentTask = null;

        this.indent.addEventListener("touchstart", this.onIndent);
        this.outdent.addEventListener("touchstart", this.onOutdent);
        this.toggleCheckCheckbox.addEventListener("touchstart", this.onToggleCheck, true);

        this.hide();
    }

    public show(): void {
        this.style.display = "flex";
    }

    public hide(): void {
        this.style.display = "none";
    }

    /**
     * setCurrentTask will override the current task whenever it is invoked.
     * @param task Task
     */
    public setCurrentTask(task: Task): void {
        this.currentTask = task;
        this.setIndentState(task.isShiftable());
        this.setOutdentState(task.isUnshiftable());
        this.setCheckboxState(true, !task.checked);
    }

    /**
     * removeCurrentTask will set the currentTask to null if it is the task passed as the
     * parameter, otherwise it has no effect.
     * @param task Task
     */
    public removeCurrentTask(task: Task): void {
        if (this.currentTask === task) {
            this.currentTask = null;
            this.setOutdentState(false);
            this.setIndentState(false);
        }
    }

    /**
     * setIndentState
     */
    private setIndentState(state: boolean): void {
        if (state) {
            this.indent.classList.add("active");
        } else {
            this.indent.classList.remove("active");
        }
    }

    /**
     * setOutdentState
     */
    private setOutdentState(state: boolean): void {
        if (state) {
            this.outdent.classList.add("active");
        } else {
            this.outdent.classList.remove("active");
        }
    }

    /**
     * setCheckboxState
     */
    private setCheckboxState(state: boolean, value: boolean = false): void {
        if (state) {
            this.toggleCheck.classList.add("active");
        } else {
            this.toggleCheck.classList.remove("active");
        }

        this.toggleCheckCheckbox.checked = value;
    }

    /**
     * onIndent
     * @param e MouseEvent
     */
    private onIndent = (e: Event): void => {
        e.preventDefault();
        if (this.currentTask) {
            this.currentTask.shift();
        }
    }

    private onOutdent = (e: Event): void => {
        e.preventDefault();
        if (this.currentTask) {
            this.currentTask.unshift();
        }
    }

    private onToggleCheck = async (e: Event): Promise<void> => {
        e.preventDefault();
        if (this.currentTask) {
            await this.currentTask.toggleChecked();
            this.toggleCheckCheckbox.checked = !this.toggleCheckCheckbox.checked;
        }
    }
}

window.customElements.define("x-controls", Controls);

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
 * On user interaction, the controls element will fire custom events on the
 * currently active task.
 */
export default class Controls extends HTMLElement {
    private currentTask: Task|null;
    private toggleCheckCheckbox: Checkbox;

    constructor() {
        super();

        this.toggleCheckCheckbox = new Checkbox("toggle-check-control");

        const template: HTMLTemplateElement = document.querySelector("#controls") as HTMLTemplateElement;
        const node: DocumentFragment = document.importNode(template.content, true);

        (node.querySelector("#toggleCheck") as HTMLAnchorElement).appendChild(this.toggleCheckCheckbox);

        this.appendChild(node);

        this.currentTask = null;
    }

    /**
     * setCurrentTask will override the current task whenever it is invoked.
     * @param task Task
     */
    public setCurrentTask(task: Task): void {
        this.currentTask = task;
        this.setIndentState(task.isShiftable());
        this.setOutdentState(task.isUnshiftable());
        this.setCheckboxState(!task.checked);
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
            this.setCheckboxState(false);
        }
    }

    /**
     * setIndentState
     */
    private setIndentState(state: boolean): void {
        if (state) {
            (this.querySelector("#indent") as HTMLElement).classList.add("active");
        } else {
            (this.querySelector("#indent") as HTMLElement).classList.remove("active");
        }
    }

    /**
     * setOutdentState
     */
    private setOutdentState(state: boolean): void {
        if (state) {
            (this.querySelector("#outdent") as HTMLElement).classList.add("active");
        } else {
            (this.querySelector("#outdent") as HTMLElement).classList.remove("active");
        }
    }

    /**
     * setcheckboxState
     */
    private setCheckboxState(state: boolean): void {
        this.toggleCheckCheckbox.checked = state;
    }
}

window.customElements.define("x-controls", Controls);

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
    private moveUp: HTMLElement;
    private moveDown: HTMLElement;
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
        this.moveUp = this.querySelector("#moveUp") as HTMLElement;
        this.moveDown = this.querySelector("#moveDown") as HTMLElement;
        this.toggleCheck = this.querySelector("#toggleCheck") as HTMLElement;

        this.currentTask = null;

        this.indent.addEventListener("touchstart", this.onIndent);
        this.outdent.addEventListener("touchstart", this.onOutdent);
        this.moveUp.addEventListener("touchstart", this.onMoveUp);
        this.moveDown.addEventListener("touchstart", this.onMoveDown);
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
        this.refresh();
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
            this.setMoveDownState(false);
            this.setMoveUpState(false);
        }
    }

    /**
     * refresh
     */
    private refresh = (): void => {
        if (this.currentTask) {
            this.setIndentState(this.currentTask.isShiftable());
            this.setOutdentState(this.currentTask.isUnshiftable());
            this.setMoveDownState(this.currentTask.isMovableDownwards());
            this.setMoveUpState(this.currentTask.isMovableUpwards());
            this.setCheckboxState(true, !this.currentTask.checked);
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
     * setMoveUpState
     * @param state boolean
     */
    private setMoveUpState(state: boolean): void {
        if (state) {
            this.moveUp.classList.add("active");
        } else {
            this.moveUp.classList.remove("active");
        }
    }

    /**
     * setMoveDownState
     * @param state boolean
     */
    private setMoveDownState(state: boolean): void {
        if (state) {
            this.moveDown.classList.add("active");
        } else {
            this.moveDown.classList.remove("active");
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
     * @param e TouchEvent
     */
    private onIndent = async (e: TouchEvent): Promise<void> => {
        e.preventDefault();
        if (this.currentTask) {
            await this.currentTask.shift();
            this.refresh();
        }
    }

    /**
     * onOutdent
     * @param e TouchEvent
     */
    private onOutdent = async (e: TouchEvent): Promise<void> => {
        e.preventDefault();
        if (this.currentTask) {
            await this.currentTask.unshift();
            this.refresh();
        }
    }

    /**
     * onMoveUp
     * @param e TouchEvent
     */
    private onMoveUp = async (e: TouchEvent): Promise<void> => {
        e.preventDefault();
        if (this.currentTask) {
            await this.currentTask.moveUp();
            this.refresh();
        }
    }

    /**
     * onMoveDown
     * @param e TouchEvent
     */
    private onMoveDown = async (e: TouchEvent): Promise<void> => {
        e.preventDefault();
        if (this.currentTask) {
            await this.currentTask.moveDown();
            this.refresh();
        }
    }

    /**
     * onToggleCheck
     * @param e TouchEvent
     */
    private onToggleCheck = async (e: TouchEvent): Promise<void> => {
        e.preventDefault();
        if (this.currentTask) {
            await this.currentTask.toggleChecked();
            this.refresh();
        }
    }
}

window.customElements.define("x-controls", Controls);

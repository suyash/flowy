import { makeRoot } from "../../root";
import { Task as TaskInterface } from "../../store/interfaces";
import store from "../../store/store";
import Checkbox from "../checkbox/checkbox";
import Controls from "../controls/controls";
import Pin from "../pin/pin";

const FOCUS_SAVE_INTERVAL: number = 5000;

export default class Task extends HTMLElement {
    private controls: Controls;
    private task: TaskInterface;
    private checkbox: Checkbox;
    private tasktext: HTMLSpanElement;
    private subtasks: HTMLElement;

    constructor(task: TaskInterface, controls: Controls) {
        super();

        this.task = task;
        this.controls = controls;

        const template: HTMLTemplateElement = document.querySelector("#task") as HTMLTemplateElement;
        const node: DocumentFragment = document.importNode(template.content, true);
        this.appendChild(node);

        this.id = task.id;

        this.subtasks = this.querySelector("footer") as HTMLElement;

        this.checkbox = new Checkbox(task.id);
        this.checked = task.checked;

        this.tasktext = document.createElement("span");
        if (task.text) {
            this.tasktext.innerText = task.text;
        }

        this.tasktext.setAttribute("contenteditable", "true");

        this.isPinned = task.pinned;

        const header: HTMLElement = this.querySelector("header") as HTMLElement;
        header.appendChild(this.checkbox);
        header.appendChild(this.tasktext);

        (this.querySelector("header > a:nth-child(1)") as HTMLElement).addEventListener("click", this.onRoot);
        (this.querySelector("header > a:nth-child(2)") as HTMLElement).addEventListener("click", this.onLinkClick);
        (this.querySelector("header > a:nth-child(3)") as HTMLElement).addEventListener("click", this.onTryResync);

        // keypress does not detect tab, backspace and some other keys
        this.tasktext.addEventListener("keydown", this.onKeyPress);

        this.tasktext.addEventListener("blur", this.updateTextCache);
        this.tasktext.addEventListener("focus", this.onFocusText);

        this.checkbox.addEventListener("change", this.onCheckboxChange);
    }

    public connectedCallback(): void {
        if (this.isPinned) {
            (document.querySelector(`#pinned-${this.id}`) as Pin).updateLocation();
        }
    }

    public disconnectedCallback(): void {
        if (this.isPinned) {
            const pinElement: HTMLElement|null = document.querySelector(`#pinned-${this.id}`) as HTMLElement;
            pinElement.remove();
        }
    }

    get expanded(): boolean {
        return this.hasAttribute("expanded");
    }

    set expanded(val: boolean) {
        if (val) {
            this.setAttribute("expanded", "true");
            this.task.collapsed = false;
        } else {
            this.removeAttribute("expanded");
            this.task.collapsed = true;
        }
    }

    get hasSubtasks(): boolean {
        return this.hasAttribute("has-subtasks");
    }

    set hasSubtasks(val: boolean) {
        if (val) {
            this.setAttribute("has-subtasks", "true");
            this.isPinned = false;
        } else {
            this.removeAttribute("has-subtasks");
        }
    }

    get root(): boolean {
        return this.hasAttribute("root");
    }

    set root(val: boolean) {
        if (val) {
            this.setAttribute("root", "true");
        } else {
            this.removeAttribute("root");
        }
    }

    get ancestor(): boolean {
        return this.hasAttribute("ancestor");
    }

    set ancestor(val: boolean) {
        if (val) {
            this.setAttribute("ancestor", "true");
        } else {
            this.removeAttribute("ancestor");
        }
    }

    get isPinned(): boolean {
        return this.hasAttribute("is-pinned");
    }

    set isPinned(val: boolean) {
        if (val) {
            this.setAttribute("is-pinned", "true");
            this.task.pinned = true;
            (document.querySelector("#pins") as HTMLElement).appendChild(new Pin(this));
        } else {
            this.removeAttribute("is-pinned");
            this.task.pinned = false;

            const pinElement: HTMLElement|null = document.querySelector(`#pinned-${this.id}`);
            if (pinElement) {
                pinElement.remove();
            }
        }
    }

    get checked(): boolean {
        return this.hasAttribute("checked");
    }

    set checked(val: boolean) {
        if (val) {
            this.setAttribute("checked", "true");
            this.isPinned = false;
        } else {
            this.removeAttribute("checked");
        }

        this.checkbox.checked = val;

        if (this.isConnected) {
            const parent: Task|null = this.parent();
            if (parent) {
                parent.verifyChecked();
            }
        }
    }

    get unsynced(): boolean {
        return this.hasAttribute("unsynced");
    }

    set unsynced(val: boolean) {
        if (val) {
            this.setAttribute("unsynced", "true");
        } else {
            this.removeAttribute("unsynced");
        }
    }

    get textElement(): HTMLSpanElement {
        return this.tasktext;
    }

    public addSubtask(task: Task): void {
        task.remove();
        this.subtasks.appendChild(task);

        this.expanded = true;
        this.hasSubtasks = true;
    }

    public freezeText(): void {
        this.tasktext.removeAttribute("contenteditable");
    }

    public async updateText(text: string): Promise<void> {
        this.tasktext.innerText = text;
        await this.updateTextCache();
    }

    public parent(): Task|null {
        const candidate: HTMLElement | null = (this.parentElement as HTMLElement).parentElement;
        if (candidate instanceof Task) {
            return candidate;
        }

        return null;
    }

    public async toggleChecked(): Promise<void> {
        this.checked = !this.checked;
        this.task.checked = this.checked;
        await store.update(this.task);
    }

    public async toggleExpanded(): Promise<void> {
        this.expanded = !this.expanded;
        await store.update(this.task);
    }

    public async togglePinned(): Promise<void> {
        this.isPinned = !this.isPinned;
        await store.update(this.task);
    }

    public isShiftable(): boolean {
        if (this.hasAttribute("root")) {
            return false;
        }

        const prevSibling: Task|null = this.previousSibling as Task|null;
        if (!prevSibling) {
            return false;
        }

        return true;
    }

    public isUnshiftable(): boolean {
        if (this.hasAttribute("root")) {
            return false;
        }

        const parent: Task = this.parent() as Task;
        const grandParent: Task = parent.parent() as Task;
        if (!grandParent || !(grandParent instanceof Task)) {
            return false;
        }

        return true;
    }

    private onCheckboxChange = async (e: Event): Promise<void> => {
        const newValue: boolean = (e.target as HTMLInputElement).checked;
        if (newValue !== this.checked) {
            await this.toggleChecked();
        }
    }

    private verifyChecked = async (): Promise<void> => {
        const uncheckedSubtask: HTMLElement|null = this.subtasks.querySelector("x-task:not([checked])");

        if ((this.checked && uncheckedSubtask) || (!this.checked && !uncheckedSubtask)) {
            await this.toggleChecked();
        }
    }

    private addSubtaskBefore = (task: Task, nextSibling: Task): void => {
        this.expanded = true;

        task.remove();
        this.subtasks.insertBefore(task, nextSibling);
    }

    private addSubtaskAfter = (task: Task, prevSibling: Task): void => {
        this.expanded = true;

        task.remove();

        const next: Task|null = prevSibling.nextSibling as Task|null;
        if (next) {
            this.subtasks.insertBefore(task, next);
        } else {
            this.subtasks.appendChild(task);
        }
    }

    private onRoot = (e: Event): void => {
        e.preventDefault();
        makeRoot(this);
    }

    private onLinkClick = (e: Event): void => {
        e.preventDefault();
        if (this.hasSubtasks) {
            this.toggleExpanded();
        } else {
            this.togglePinned();
        }
    }

    private onTryResync = async (e: Event): Promise<void> => {
        e.preventDefault();
        await store.update(this.task);
    }

    private onKeyPress = async (e: KeyboardEvent): Promise<void> => {
        if (e.shiftKey) {
            switch (e.keyCode) {
            case 9: // tab
                e.preventDefault();
                await this.unshift();
                break;
            case 38: // ArrowUp
                e.preventDefault();
                await this.moveUp();
                break;
            case 40: // ArrowDown
                e.preventDefault();
                await this.moveDown();
                break;
            }

            return;
        }

        if (e.ctrlKey) {
            switch (e.keyCode) {
            case 8: // backspace
                e.preventDefault();
                await this.drop();
                break;
            case 13: // enter
                e.preventDefault();
                await this.toggleChecked();
                break;
            case 38: // ArrowUp
                e.preventDefault();
                this.expanded = false;
                break;
            case 40: // ArrowDown
                e.preventDefault();
                this.expanded = true;
                break;
            }

            return;
        }

        switch (e.keyCode) {
        case 9: // tab
            e.preventDefault();
            await this.shift();
            break;
        case 13: // enter
            e.preventDefault();
            await this.addSibling();
            break;
        case 38: // ArrowUp
            e.preventDefault();
            await this.moveFocusUp();
            break;
        case 40: // ArrowDown
            e.preventDefault();
            await this.moveFocusDown();
            break;
        }
    }

    private removeSubtask = async (id: string): Promise<void> => {
        this.task.children = this.task.children.filter((cid: string): boolean => cid !== id);
        if (this.task.children.length === 0) {
            this.hasSubtasks = false;
            this.expanded = false;
        }

        await store.update(this.task);
    }

    private drop = async (): Promise<void> => {
        const parent: Task = this.parent() as Task;
        this.remove();

        await Promise.all([
            parent.removeSubtask(this.id),
            store.remove(this.task),
        ]);
    }

    private addSibling = async (): Promise<void> => {
        if (this.hasAttribute("root")) {
            return;
        }

        const parent: Task = this.parent() as Task;

        const nextSibling: Task|null = this.nextSibling as Task|null;

        if (!nextSibling) {
            const newTask: TaskInterface = await store.create(parent.task);
            const newTaskElement: Task = new Task(newTask, this.controls);
            parent.addSubtask(newTaskElement);
            (newTaskElement.tasktext as HTMLElement).focus();
        } else {
            const newTask: TaskInterface = await store.createBefore(parent.task, nextSibling.task);
            const newTaskElement: Task = new Task(newTask, this.controls);
            parent.addSubtaskBefore(newTaskElement, nextSibling);
            (newTaskElement.tasktext as HTMLElement).focus();
        }
    }

    private shift = async (): Promise<void> => {
        if (this.hasAttribute("root")) {
            return;
        }

        const prevSibling: Task|null = this.previousSibling as Task|null;
        if (!prevSibling) {
            return;
        }

        const pos: number = this.getCursorPosition();

        const parent: Task = this.parent() as Task;
        parent.removeSubtask(this.task.id);

        prevSibling.task.children.push(this.task.id);
        await store.update(prevSibling.task);

        prevSibling.addSubtask(this);
        this.tasktext.focus();
        this.setCursorPosition(pos);
    }

    private unshift = async (): Promise<void> => {
        if (this.hasAttribute("root")) {
            return;
        }

        const parent: Task = this.parent() as Task;
        const grandParent: Task = parent.parent() as Task;
        if (!grandParent || !(grandParent instanceof Task)) {
            return;
        }

        const pos: number = this.getCursorPosition();

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
            store.update(grandParent.task),
        ]);

        this.tasktext.focus();
        this.setCursorPosition(pos);
    }

    private updateTextCache = async (): Promise<void> => {
        this.task.text = this.tasktext.innerText;
        if (this.task.text) {
            await store.update(this.task);
        } else {
            await this.drop();
        }

        this.controls.removeCurrentTask(this);
    }

    private onFocusText = (): void => {
        const update: () => Promise<void> = async (): Promise<void> => {
            if (this.tasktext !== document.activeElement) {
                return;
            }

            if (this.task.text !== this.tasktext.innerText) {
                this.task.text = this.tasktext.innerText;
                await store.update(this.task);
            }

            setTimeout(update, FOCUS_SAVE_INTERVAL);
        };

        this.controls.setCurrentTask(this);
    }

    private moveUp = async (): Promise<void> => {
        const element: Task|null = this.previousSibling as Task|null;
        if (!element) {
            return;
        }

        const parent: Task|null = this.parent();
        if (!parent) {
            return;
        }

        const cursor: number = this.getCursorPosition();

        const idx: number = parent.task.children.indexOf(element.id);
        parent.task.children[idx] = this.id;
        parent.task.children[idx + 1] = element.id;

        parent.addSubtaskBefore(this, element);

        this.tasktext.focus();
        this.setCursorPosition(cursor);

        await store.update(parent.task);
    }

    private moveDown = async (): Promise<void> => {
        const element: Task|null = this.nextSibling as Task|null;
        if (!element) {
            return;
        }

        const parent: Task|null = this.parent();
        if (!parent) {
            return;
        }

        const cursor: number = this.getCursorPosition();

        const idx: number = parent.task.children.indexOf(element.id);
        parent.task.children[idx] = this.id;
        parent.task.children[idx - 1] = element.id;

        parent.addSubtaskAfter(this, element);

        this.tasktext.focus();
        this.setCursorPosition(cursor);

        await store.update(parent.task);
    }

    private moveFocusUp = async (): Promise<void> => {
        const element: Task|null = this.previousSibling as Task|null;
        if (element) {
            this.moveFocus(element);
            return;
        }

        const parent: Task = this.parent() as Task;
        if (!parent.root) {
            this.moveFocus(parent);
        }
    }

    private moveFocusDown = async (): Promise<void> => {
        const element: Task = this.nextSibling as Task;
        if (element) {
            this.moveFocus(element);
        }
    }

    private moveFocus = (task: Task): void => {
        const pos: number = this.getCursorPosition();
        this.tasktext.blur();

        task.tasktext.focus();
        task.setCursorPosition(pos);
    }

    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/Selection
     * https://developer.mozilla.org/en-US/docs/Web/API/range
     */

    private getCursorPosition = (): number => {
        const selection: Selection = window.getSelection();
        if (selection.rangeCount) {
            const range: Range = selection.getRangeAt(0);
            if (range.commonAncestorContainer.parentNode === this.tasktext) {
                return range.endOffset;
            }
        }

        return 0;
    }

    private setCursorPosition = (pos: number): void => {
        if (!this.tasktext.childNodes || !this.tasktext.childNodes.length) {
            return;
        }

        const range: Range = document.createRange();
        range.setStart(this.tasktext.childNodes[0], pos);
        range.collapse(true);

        const sel: Selection = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

window.customElements.define("x-task", Task);

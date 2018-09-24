export default class Checkbox extends HTMLElement {
    private node: DocumentFragment;
    private input: HTMLInputElement;

    constructor(id: string, checked: boolean = false) {
        super();

        const template: HTMLTemplateElement = document.querySelector("#checkbox") as HTMLTemplateElement;
        this.node = document.importNode(template.content, true);
        this.appendChild(this.node);

        this.input = this.querySelector("input") as HTMLInputElement;

        this.input.id = `checkbox-${id}`;
        (this.querySelector("label") as HTMLLabelElement).setAttribute("for", `checkbox-${id}`);

        this.checked = checked;

        this.input.addEventListener("change", this.onChange);
    }

    get checked(): boolean {
        return this.hasAttribute("checked");
    }

    set checked(val: boolean) {
        if (val) {
            this.setAttribute("checked", "true");
        } else {
            this.removeAttribute("checked");
        }

        this.input.checked = val;
    }

    private onChange = (): void => {
        if (this.input.checked) {
            this.setAttribute("checked", "true");
        } else {
            this.removeAttribute("checked");
        }
    }
}

window.customElements.define("x-checkbox", Checkbox);

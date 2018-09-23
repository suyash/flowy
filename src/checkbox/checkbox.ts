export default class Checkbox extends HTMLElement {
    private node: DocumentFragment;
    private input: HTMLInputElement;

    constructor(id: string) {
        super();

        const template: HTMLTemplateElement = document.querySelector("#checkbox") as HTMLTemplateElement;
        this.node = document.importNode(template.content, true);
        this.appendChild(this.node);

        this.input = this.querySelector("input") as HTMLInputElement;

        this.input.id = `checkbox-${id}`;
        (this.querySelector("label") as HTMLLabelElement).setAttribute("for", `checkbox-${id}`);

        this.input.addEventListener("change", this.onChange);
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

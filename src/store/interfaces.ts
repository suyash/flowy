export interface Task {
    id: string;
    text: string;
    checked: boolean;
    children: string[];
}

export function uuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (): string => {
        return Math.floor(Math.random() * 16).toString(16);
    });
}

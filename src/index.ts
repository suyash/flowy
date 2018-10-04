declare var USE_SERVICE_WORKER: boolean;

import "./main.scss";

import "@webcomponents/custom-elements";

import main from "./main";

if (USE_SERVICE_WORKER) {
    navigator.serviceWorker.register("sw.js")
        // tslint:disable-next-line:no-console
        .then(() => console.log("service worker registered"))
        // tslint:disable-next-line:no-console
        .catch((err: Error) => console.error("service worker registration error", err));
}

window.addEventListener("DOMContentLoaded", main);

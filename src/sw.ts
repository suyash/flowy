const VERSION: string = "CACHE_VERSION";

const PRECACHE_URLS: string[] = [
    "./",
    "./index.css",
    "./index.js",
];

self.addEventListener("install", (event: any): void => {
    event.waitUntil(precache().then(() => {
        (self as any).skipWaiting();
    }));
});

async function precache(): Promise<void> {
    const now: number = Date.now();
    const cache: Cache = await caches.open(`v${VERSION}`);

    await Promise.all(PRECACHE_URLS.map((u: string): Promise<void> => {
        const url: string = `${u}?cache-bust=${now}`;

        const request: Request = new Request(url, { mode: "no-cors" });
        return fetch(request).then((res: Response): void => {
            if (res.status === 200) {
                cache.put(u, res);
            }
        });
    }));
}

self.addEventListener("activate", (event: any) => {
    event.waitUntil(removeUnusedCaches());
});

async function removeUnusedCaches(): Promise<void> {
    const cacheNames: string[] = await caches.keys();
    const cacheNamesToRemove: string[] = cacheNames.filter((cacheName: string) => cacheName !== `v${VERSION}`);
    await Promise.all(cacheNamesToRemove.map((cacheName: string): Promise<boolean> => caches.delete(cacheName)));
    (self as any).clients.claim();
}

self.addEventListener("fetch", (event: any) => {
    event.respondWith(handle(event.request));
});

async function handle(req: Request): Promise<Response> {
    const res: Response|undefined = await caches.match(req);
    if (res) {
        return res;
    }

    return fetch(req);
}

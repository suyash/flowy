# flowy

Open Source Workflowy implementation.

3 main goals

- **Works Offline**: It installs a service worker and works using IndexedDB as an offline first cache.
- **Works signed out**: No need to sign in to anything to use it, works out of the box with the browser cache. The browser cache will generally persist unless it is unused for a very long time.
- **"Moving" Storage**: To get off-browser persistence and sync the same set of tasks on another device, allows plugging in your own storage server with an verification key, allowing resyncing the remote storage with your local tasks, or vice-versa. There are also a couple of sample server implementations for trying things out.

For persistence, there are a couple of server implementations in [flowy-servers](https://github.com/suyash/flowy-servers).

- **TODO: Multi-Device Sync**: Currently the sync will update a task with wherever the latest update comes from, which is not a great strategy for using the same storage on multiple devices.

## LICENSES

The project is under [BSD-3 Clause](/LICENSE)

The checkbox is taken from the [material design icons](http://google.github.io/material-design-icons/), Apache 2.0 License.

The button icons in the shortcuts bar for phone displays are taken from [the arrows collection in the noun project by Salvia Santos](https://thenounproject.com/Salvinorina-a/collection/arrows/), Creative Commons License.

## Hacking

```
yarn install
```

```
yarn watch
```

will start watching files for updates.

```
yarn start
```

will start a local server on 3000.

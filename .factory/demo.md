# Demo contract

## CLI demo

Run `escape-hatch demo` from any directory. The binary embeds the two original files in `examples/`.

The command creates a uniquely named directory under the operating system's temporary directory. It writes both sample exports and `migration-report.md` there, then prints the report path.

The command never reads or writes the caller's working directory. Each run receives a new temporary workspace.

## Browser demo

- Catalog URL: `https://collection-escape-hatch.sociobot.in/?demo=1`
- Canonical route: `https://collection-escape-hatch.sociobot.in/demo/`
- Sample: Acme Orders, with a lossy Postman-to-Hoppscotch import.
- Reset: use **Reset demo** in the persistent banner or comparison controls.
- Exit: use **Start for real**. This discards the in-memory sample and returns home.

The browser uses a separate `demoState` object held only in memory. It never reads from or writes to Web Storage, IndexedDB, OPFS, or cookies.

Real file selections use a separate `realState` object. Entering, resetting, or leaving demo mode never reads or changes that object.

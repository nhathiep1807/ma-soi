// Node.js 25+ exposes a broken global localStorage on the server (getItem is missing).
// Next.js dev overlay checks `typeof localStorage !== "undefined"` and then crashes on SSR.
if (
  typeof globalThis.localStorage !== "undefined" &&
  typeof globalThis.localStorage.getItem !== "function"
) {
  Reflect.deleteProperty(globalThis, "localStorage");
}

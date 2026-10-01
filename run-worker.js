// Worker de ejecucion: corre el programa (wasm32-wasi) con un caso de entrada.
// Si se pasa del tiempo, la pagina principal mata este worker (TLE).
import { WASI, File, OpenFile, ConsoleStdout } from 'https://cdn.jsdelivr.net/npm/@bjorn3/browser_wasi_shim@0.4.2/dist/index.js';

const enc = new TextEncoder(), dec = new TextDecoder();
let mod = null;

onmessage = async ({ data }) => {
  if (data.type === 'load') {
    mod = await WebAssembly.compile(data.wasm);
    postMessage({ type: 'loaded' });
    return;
  }
  const { id, input } = data;
  let out = '', err = '';
  const fds = [
    new OpenFile(new File(enc.encode(input))),
    new ConsoleStdout(b => { out += dec.decode(b, { stream: true }); }),
    new ConsoleStdout(b => { err += dec.decode(b, { stream: true }); }),
  ];
  const wasi = new WASI(['prog'], [], fds);
  const t0 = performance.now();
  let code, crash = null;
  try {
    const inst = await WebAssembly.instantiate(mod, { wasi_snapshot_preview1: wasi.wasiImport });
    code = wasi.start(inst);
  } catch (e) {
    crash = String(e && e.message || e);
  }
  postMessage({ type: 'done', id, out, err, code, crash, time: performance.now() - t0 });
};

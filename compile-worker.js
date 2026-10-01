// Worker de compilacion: clang++ compilado a WebAssembly (YoWASP), corre en el navegador.
import { runClang } from 'https://cdn.jsdelivr.net/npm/@yowasp/clang@22.0.0-git20542-10/gen/bundle.js';

const GRADER = "#include <bits/stdc++.h>\n#include \"arbol.h\"\nusing namespace std;\n\nint main()\n{\n    long long N, X, K, D;\n    if (scanf(\"%lld %lld %lld %lld\", &N, &X, &K, &D) != 4) return 1;\n    printf(\"%lld\\n\", minimo_cortes(N, X, K, D));\n    return 0;\n}\n";
const ARBOL_H = "#ifndef ARBOL_H\n#define ARBOL_H\n\n// Devuelve el minimo numero de cortes para dejar el arbol con exactamente X hojas,\n// o -1 si es imposible.\nlong long minimo_cortes(long long N, long long X, long long K, long long D);\n\n#endif\n";
const BITS = "#include <cassert>\n#include <cctype>\n#include <cfloat>\n#include <climits>\n#include <cmath>\n#include <cstdio>\n#include <cstdlib>\n#include <cstring>\n#include <ctime>\n#include <cstdint>\n#include <algorithm>\n#include <array>\n#include <bitset>\n#include <complex>\n#include <deque>\n#include <functional>\n#include <iomanip>\n#include <iostream>\n#include <istream>\n#include <iterator>\n#include <limits>\n#include <list>\n#include <map>\n#include <memory>\n#include <numeric>\n#include <ostream>\n#include <queue>\n#include <random>\n#include <set>\n#include <sstream>\n#include <stack>\n#include <string>\n#include <tuple>\n#include <unordered_map>\n#include <unordered_set>\n#include <utility>\n#include <vector>\n#include <chrono>\n#include <optional>\n#include <variant>\n#include <string_view>\n#include <numeric>\n#include <cinttypes>\n";

const FLAGS = ['-O2', '-std=c++17', '-fno-exceptions', '-Iinc'];
const dec = new TextDecoder();

async function compile(code, onProgress) {
  let log = '';
  const collect = b => { if (b) log += dec.decode(b); };
  const files = {
    'grader.cpp': GRADER, 'arbol.h': ARBOL_H, 'arbol.cpp': code,
    inc: { bits: { 'stdc++.h': BITS } },
  };
  try {
    const out = await runClang(['clang++', ...FLAGS, 'grader.cpp', 'arbol.cpp', '-o', 'prog.wasm'], files,
      { stdout: collect, stderr: collect, fetchProgress: onProgress });
    return { ok: true, wasm: out['prog.wasm'], log };
  } catch (e) {
    return { ok: false, log: log || String(e) };
  }
}

onmessage = async ({ data }) => {
  if (data.type === 'warmup') {
    let last = -1;
    await compile('long long minimo_cortes(long long,long long,long long,long long){return 0;}', ev => {
      const p = Math.floor(100 * ev.doneLength / ev.totalLength);
      if (p !== last) { last = p; postMessage({ type: 'progress', p }); }
    });
    postMessage({ type: 'ready' });
  } else if (data.type === 'compile') {
    const r = await compile(data.code);
    postMessage({ type: 'compiled', ...r });
  }
};

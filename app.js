import { marked } from 'https://cdn.jsdelivr.net/npm/marked@12.0.2/lib/marked.esm.js';

const TL = 2000; // limite de tiempo por caso (ms); WebAssembly es ~2-3x mas lento que nativo
const POINTS = { 1: 10, 2: 20, 3: 30, 4: 40 };
const TEMPLATE = `#include "arbol.h"

long long minimo_cortes(long long N, long long X, long long K, long long D)
{
    // Tu codigo aqui
    return -1;
}
`;

const $ = id => document.getElementById(id);
const code = $('code'), btn = $('submit'), status = $('status'), result = $('result');

// ---------- enunciado ----------
fetch('enunciado.md').then(r => r.text()).then(md => { $('statement').innerHTML = marked.parse(md); });

// ---------- editor ----------
try { code.value = localStorage.getItem('arbol-code') || TEMPLATE; } catch { code.value = TEMPLATE; }
code.addEventListener('input', () => { try { localStorage.setItem('arbol-code', code.value); } catch {} });
code.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    e.preventDefault();
    code.setRangeText('    ', code.selectionStart, code.selectionEnd, 'end');
  }
});
$('file').addEventListener('change', async e => {
  const f = e.target.files[0];
  if (f) { code.value = await f.text(); code.dispatchEvent(new Event('input')); }
  e.target.value = '';
});
$('reset').addEventListener('click', () => {
  if (confirm('¿Restaurar la plantilla? Se pierde el codigo actual.')) { code.value = TEMPLATE; code.dispatchEvent(new Event('input')); }
});

// ---------- compilador ----------
const tests = fetch('tests.json').then(r => r.json());
const compiler = new Worker('compile-worker.js', { type: 'module' });
let compilerReady = false, pendingCompile = null;
compiler.onmessage = ({ data }) => {
  if (data.type === 'progress') status.textContent = `Cargando compilador C++... ${data.p}% (solo la primera vez, ~50 MB)`;
  else if (data.type === 'ready') { compilerReady = true; status.textContent = 'Compilador listo.'; btn.disabled = false; }
  else if (data.type === 'compiled') { pendingCompile(data); pendingCompile = null; }
};
compiler.onerror = e => { status.textContent = 'Error cargando el compilador: ' + (e.message || 'revisa la consola'); };
compiler.postMessage({ type: 'warmup' });

const compile = src => new Promise(res => { pendingCompile = res; compiler.postMessage({ type: 'compile', code: src }); });

// ---------- ejecucion ----------
function newRunner(wasm) {
  const w = new Worker('run-worker.js', { type: 'module' });
  const ready = new Promise(res => { w.onmessage = () => res(); });
  w.postMessage({ type: 'load', wasm });
  return { w, ready };
}

async function runAll(wasm, list, onResult) {
  let runner = newRunner(wasm);
  await runner.ready;
  const failed = new Set();
  for (const [i, t] of list.entries()) {
    if (failed.has(t.subtask)) { onResult(t, { verdict: 'skip' }); continue; } // subtarea ya perdida
    const r = await new Promise(res => {
      const timer = setTimeout(() => res({ verdict: 'TLE', time: null }), TL + 500);
      runner.w.onmessage = ({ data }) => { clearTimeout(timer); res(judge(t, data)); };
      runner.w.postMessage({ id: i, input: t.in });
    });
    if (r.verdict === 'TLE' && r.time === null) { // el worker sigue colgado: matarlo
      runner.w.terminate();
      runner = newRunner(wasm);
      await runner.ready;
    }
    if (r.verdict !== 'AC') failed.add(t.subtask);
    onResult(t, r);
  }
  runner.w.terminate();
}

const tokens = s => s.split(/\s+/).filter(Boolean);
function judge(t, d) {
  if (d.crash || d.code !== 0) return { verdict: 'RE', time: d.time, detail: d.crash || `codigo de salida ${d.code}` };
  if (d.time > TL) return { verdict: 'TLE', time: d.time };
  const a = tokens(d.out), b = tokens(t.out);
  const ok = a.length === b.length && a.every((x, i) => x === b[i]);
  return { verdict: ok ? 'AC' : 'WA', time: d.time, got: d.out.trim().slice(0, 100) };
}

// ---------- envio ----------
const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

btn.addEventListener('click', async () => {
  if (!compilerReady) return;
  btn.disabled = true;
  result.innerHTML = '';
  status.textContent = 'Compilando...';
  const c = await compile(code.value);
  if (!c.ok) {
    status.textContent = 'Error de compilacion';
    result.innerHTML = `<div class="verdict CE">Error de compilación</div><pre class="log">${esc(c.log)}</pre>`;
    btn.disabled = false;
    return;
  }
  const list = await tests;
  const subs = [...new Set(list.map(t => t.subtask))];
  result.innerHTML = (c.log ? `<details><summary>Advertencias del compilador</summary><pre class="log">${esc(c.log)}</pre></details>` : '') +
    `<div id="total" class="verdict">Evaluando...</div>` +
    subs.map(s => `<div class="sub" id="sub${s}"><div class="subhead"><b>Subtarea ${s}</b><span class="pts">— / ${POINTS[s]}</span></div><div class="chips"></div></div>`).join('');
  const state = {};
  for (const s of subs) state[s] = { total: list.filter(t => t.subtask === s).length, done: 0, ok: true };
  let done = 0;
  await runAll(c.wasm, list, (t, r) => {
    done++;
    status.textContent = `Evaluando ${done}/${list.length}...`;
    const st = state[t.subtask];
    st.done++;
    if (r.verdict !== 'AC') st.ok = false;
    const chip = document.createElement('span');
    chip.className = 'chip ' + r.verdict;
    chip.textContent = r.verdict === 'skip' ? '—' : r.verdict;
    chip.title = r.verdict === 'skip' ? `${t.name}: no evaluado (la subtarea ya falló)` : `${t.name}: ${r.verdict}` + (r.time != null ? ` (${Math.round(r.time)} ms)` : '') +
      (r.detail ? `\n${r.detail}` : '') + (r.verdict === 'WA' ? `\nobtenido: ${r.got || '(vacío)'}` : '');
    const box = $('sub' + t.subtask);
    box.querySelector('.chips').appendChild(chip);
    if (st.done === st.total) {
      box.querySelector('.pts').textContent = `${st.ok ? POINTS[t.subtask] : 0} / ${POINTS[t.subtask]}`;
      box.classList.add(st.ok ? 'ok' : 'bad');
    }
  });
  const score = subs.reduce((a, s) => a + (state[s].ok ? POINTS[s] : 0), 0);
  const tot = $('total');
  tot.textContent = `Puntaje: ${score} / 100`;
  tot.className = 'verdict ' + (score === 100 ? 'AC' : score > 0 ? 'PARTIAL' : 'WA');
  status.textContent = 'Listo. Pasa el mouse sobre un caso para ver el detalle.';
  btn.disabled = false;
});

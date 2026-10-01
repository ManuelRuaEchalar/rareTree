# Árbol extraño — juez de prueba

Página estática para leer el problema y enviar una solución en C++. Todo corre en el navegador:
clang++ compilado a WebAssembly ([YoWASP](https://yowasp.org/)) compila `grader.cpp` + la solución,
y el binario (wasm32-wasi) se ejecuta en un Web Worker contra cada caso.

- `index.html`, `app.js` — interfaz y evaluación (TL 2 s por caso, puntaje por subtarea).
- `compile-worker.js` — compilación (incluye `grader.cpp`, `arbol.h` y un `bits/stdc++.h`).
- `run-worker.js` — ejecución de cada caso.
- `enunciado.md`, `tests.json` — enunciado y casos (`python3 tools/gen-tests.py <carpeta-tests>` regenera los casos).

Despliegue: Vercel como sitio estático, sin build. La primera carga baja ~50 MB del compilador desde jsDelivr (luego queda en caché).

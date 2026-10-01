# Regenera tests.json a partir de la carpeta de tests del problema.
# Uso: python3 tools/gen-tests.py ../arbol-extrano/tests
import json, os, sys
d = sys.argv[1] if len(sys.argv) > 1 else '../arbol-extrano/tests'
tests = []
for f in sorted(os.listdir(d)):
    if not f.endswith('.in'):
        continue
    name = f[:-3]
    tests.append({
        'name': name,
        'subtask': int(name[1:name.index('-')]),
        'in': open(os.path.join(d, f)).read(),
        'out': open(os.path.join(d, name + '.out')).read(),
    })
json.dump(tests, open(os.path.join(os.path.dirname(__file__), '..', 'tests.json'), 'w'))
print(len(tests), 'casos')

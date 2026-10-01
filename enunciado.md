# Árbol extraño

## Historia

Esta semana la Oficina de Biólogos Introvertidos (OBI) presenta, en una importante conferencia sobre la fauna y flora del país, un árbol de hojas fosforescentes: ¡sus hojas brillan en la oscuridad! Para que luzca perfecto esa noche, el árbol debe tener **exactamente X hojas**, pero ahora tiene **N**.

Bob, el jardinero de la OBI, cortará hojas del árbol de una en una. Sus tijeras son algo peculiares: de las N hojas, **K son especiales** y las otras N − K son normales.

- Al cortar una hoja **normal**, cae solo esa hoja.
- Al cortar una hoja **especial**, ¡mágicamente caen junto con ella otras **D** hojas del árbol! Estas hojas pueden ser normales o especiales, y Bob puede escoger cuáles (se busca el mejor caso posible). Bob solo puede cortar una hoja especial si el árbol tiene al menos D hojas más.

Las hojas que caen no vuelven al árbol. Cada corte cuenta como **un** corte, caiga una hoja o D + 1.

Bob quiere dejar el árbol con exactamente X hojas usando el **mínimo número de cortes**. Si es imposible lograrlo, la respuesta es −1.

## Entrada

Debes implementar la función:

```
long long minimo_cortes(long long N, long long X, long long K, long long D)
```

(en Python: `def minimo_cortes(N, X, K, D)`), donde:

- `N`: la cantidad de hojas que tiene el árbol.
- `X`: la cantidad de hojas que debe tener el árbol.
- `K`: la cantidad de hojas especiales.
- `D`: la cantidad de hojas adicionales que caen al cortar una hoja especial.

El grader lee una línea con los cuatro enteros `N X K D` y llama a la función.

## Salida

La función debe devolver el mínimo número de cortes para dejar el árbol con exactamente X hojas, o −1 si es imposible.

## Restricciones

- 1 ≤ N ≤ 10^18
- 1 ≤ X ≤ 10^18 (X puede ser mayor que N)
- 0 ≤ K ≤ N
- 1 ≤ D ≤ 10^18

## Subtareas

| Subtarea | Puntos | Restricciones adicionales |
|---|---|---|
| 1 | 10 | K = 0, y N, X, D ≤ 10^9 |
| 2 | 20 | K = N, y N, X, D ≤ 10^9 |
| 3 | 30 | N, X, D ≤ 10^6 |
| 4 | 40 | Sin restricciones adicionales |

## Ejemplos

| N X K D | Salida |
|---|---|
| `20 8 8 3` | `3` |
| `20 6 8 3` | `5` |
| `10 6 10 2` | `-1` |

**Ejemplo 1.** Hay que quitar 12 hojas. Cada corte de una hoja especial quita 4 hojas (la cortada y 3 más), así que 3 cortes especiales bastan.

**Ejemplo 2.** Hay que quitar 14 hojas. Tres cortes especiales quitan 12 y faltan 2, que Bob corta de una en una entre las hojas normales. En total son 3 + 2 = 5 cortes.

**Ejemplo 3.** Hay que quitar 4 hojas, pero las 10 hojas son especiales y cada corte quita 3. Un corte deja 7 hojas y otro dejaría 4: es imposible llegar a exactamente 6.

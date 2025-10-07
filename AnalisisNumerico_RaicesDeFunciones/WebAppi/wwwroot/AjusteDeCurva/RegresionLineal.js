// ================== ENDPOINT ==================
const END_LINEAL = "/api/RegresionLineal";

// ================== GeoGebra ==================
let ggbLin = null;
let ggbLinReadyResolve;
const ggbLinReady = new Promise(res => (ggbLinReadyResolve = res));

document.addEventListener("DOMContentLoaded", () => {
    const params = {
        appName: "graphing",
        width: 900,
        height: 520,
        showToolBar: false,
        showAlgebraInput: false,
        showMenuBar: false,
        perspective: "G",
        enableUndoRedo: false,
        appletOnLoad: (api) => {
            ggbLin = api;
            console.log("GeoGebra (lineal) cargado correctamente.");
            ggbLinReadyResolve();
        },
    };
    const app = new GGBApplet(params, true); // no setHTML5Codebase en localhost
    app.inject("ggb-lineal");

    // ================== UI ==================
    const tbody = document.querySelector("#tabla-puntos tbody");
    const btnAgregar = document.getElementById("agregar-punto");
    const btnCalcular = document.getElementById("calcular");
    const tolInput = document.getElementById("rl-tol");

    if (!tbody || !btnAgregar || !btnCalcular || !tolInput) {
        console.error("IDs faltantes en el HTML (tabla-puntos/agregar-punto/calcular/rl-tol).");
        return;
    }

    // Agregar fila
    btnAgregar.addEventListener("click", () => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td><input type="number" step="any" value="0"></td>
      <td><input type="number" step="any" value="0"></td>
      <td><button class="row-del">✕</button></td>`;
        tbody.appendChild(tr);
    });

    // Eliminar fila (delegado)
    tbody.addEventListener("click", (e) => {
        if (e.target.classList.contains("row-del")) {
            e.target.closest("tr").remove();
        }
    });

    // Utils numéricos
    const toNum = v => Number((v + "").replace(",", "."));

    // Leer puntos
    function leerPuntos() {
        const pts = [];
        for (const tr of tbody.querySelectorAll("tr")) {
            const x = toNum(tr.children[0].querySelector("input").value);
            const y = toNum(tr.children[1].querySelector("input").value);
            if (Number.isFinite(x) && Number.isFinite(y)) pts.push([x, y]);
        }
        return pts;
    }

    // === Parser robusto: "y = a1 x + a0"  ->  [a0, a1] ===
    function parseCoeffsFromFuncion(funcion) {
        if (!funcion) return null;

        // normalizo: minúsculas, sin espacios, coma -> punto
        let s = (funcion + "")
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/,/g, ".");

        // debe contener "y=" y luego algo con "x"
        const idxEq = s.indexOf("y=");
        const idxX = s.indexOf("x", idxEq + 2);
        if (idxEq === -1 || idxX === -1) return null;

        // tramo pendiente (entre '=' y 'x')
        let a1str = s.slice(idxEq + 2, idxX);
        if (a1str.endsWith("*")) a1str = a1str.slice(0, -1);

        // tramo independiente (después de 'x'); si vacío, 0
        let a0str = s.slice(idxX + 1);
        if (a0str === "") a0str = "+0";

        // admitir "+-": convertir a signo único
        a0str = a0str.replace(/\+\-/g, "-");

        const a1 = Number(a1str);
        const a0 = Number(a0str);

        if (!Number.isFinite(a1) || !Number.isFinite(a0)) return null;
        return [a0, a1];
    }

    // Calcular
    btnCalcular.addEventListener("click", async () => {
        const Puntos = leerPuntos();
        const Tolerancia = parseFloat(tolInput.value || "0.8");

        if (Puntos.length < 2) {
            alert("Ingresá al menos 2 puntos.");
            return;
        }

        let res;
        try {
            res = await fetch(END_LINEAL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Puntos, Tolerancia }),
            });
        } catch (err) {
            console.error(err);
            alert("No se pudo contactar al backend.");
            return;
        }

        if (!res.ok) {
            const txt = await res.text();
            console.error("Error HTTP", res.status, txt);
            alert(`Error ${res.status}: ${txt}`);
            return;
        }

        const data = await res.json();
        console.log("Lineal -> respuesta", data);

        // Mostrar resultados
        document.getElementById("funcion").textContent =
            data.Funcion ?? data.funcion ?? "—";
        document.getElementById("correlacion").textContent =
            (Number(data.Correlacion ?? data.correlacion ?? 0).toFixed(2)) + " %";
        document.getElementById("efectividad").textContent =
            data.EfectividadAjuste ?? data.efectividadAjuste ?? "—";

        // ---- Coeficientes: del backend o parseando la función ----
        let C = data.Coeficientes ?? data.coeficientes;
        if (!Array.isArray(C) || C.length !== 2) {
            const fx = data.Funcion ?? data.funcion ?? "";
            C = parseCoeffsFromFuncion(fx);
            if (!C) console.warn("No pude parsear 'Funcion':", fx);
        }
        if (Array.isArray(C)) C = C.map(toNum);

        // GeoGebra
        await ggbClearLin();
        await ggbAddPointsLin(Puntos);
        if (Array.isArray(C) && C.length === 2 && C.every(Number.isFinite)) {
            const [a0, a1] = C;
            await ggbPlotLine(a0, a1);
        } else {
            console.warn("Coeficientes no válidos para la recta:", C);
        }
        await ggbFitLin(Puntos);
    });
});

// ================== Funciones GeoGebra ==================
async function ggbClearLin() {
    await ggbLinReady;
    try { ggbLin.evalCommand("Delete[All]"); }
    catch (e) { console.warn("No se pudo limpiar GeoGebra (lineal)", e); }
}

async function ggbAddPointsLin(pts) {
    await ggbLinReady;
    try {
        pts.forEach((p, i) => {
            const x = Number((p[0] + "").replace(",", "."));
            const y = Number((p[1] + "").replace(",", "."));
            ggbLin.evalCommand(`P${i + 1} = (${x}, ${y})`);
        });
    } catch (e) {
        console.error("Error al enviar puntos a GeoGebra:", e);
    }
}

async function ggbPlotLine(a0, a1) {
    await ggbLinReady;

    const a0n = Number((a0 + "").replace(",", "."));
    const a1n = Number((a1 + "").replace(",", "."));
    if (!Number.isFinite(a0n) || !Number.isFinite(a1n)) {
        console.warn("Coeficientes inválidos para GeoGebra:", a0, a1);
        return;
    }

    const def = `f(x) = (${a1n})*x + (${a0n})`;
    try {
        let label = "f";
        if (typeof ggbLin.evalCommandGetLabels === "function") {
            label = ggbLin.evalCommandGetLabels(def) || "f";
        } else {
            ggbLin.evalCommand(def);
        }
        ggbLin.setLineThickness(label, 5);
        ggbLin.setColor(label, 34, 197, 94); // mismo verde que polinomial
        console.log("GeoGebra creó la recta:", label, "=>", def);
    } catch (e) {
        console.error("GeoGebra no pudo crear la recta con:", def, e);
    }
}

async function ggbFitLin(pts) {
    await ggbLinReady;
    if (pts.length === 0) return;

    const xs = pts.map(p => Number((p[0] + "").replace(",", ".")));
    const ys = pts.map(p => Number((p[1] + "").replace(",", ".")));
    const xmin = Math.min(...xs), xmax = Math.max(...xs);
    const ymin = Math.min(...ys), ymax = Math.max(...ys);
    const padX = (xmax - xmin || 1) * 0.2, padY = (ymax - ymin || 1) * 0.2;

    try {
        ggbLin.evalCommand(`ZoomIn[${xmin - padX},${ymin - padY},${xmax + padX},${ymax + padY}]`);
    } catch (e) {
        console.warn("ZoomIn falló:", e);
    }
}

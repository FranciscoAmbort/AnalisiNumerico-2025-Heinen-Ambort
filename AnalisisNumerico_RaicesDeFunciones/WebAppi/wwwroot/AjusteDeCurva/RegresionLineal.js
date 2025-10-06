// ========== GeoGebra ==========
let ggbLin = null;
let ggbReadyResolve;
const ggbReady = new Promise(res => ggbReadyResolve = res);

document.addEventListener("DOMContentLoaded", () => {
    const params = {
        appName: "graphing",
        width: 900, height: 520,
        showToolBar: false, showAlgebraInput: false, showMenuBar: false,
        perspective: "G", enableUndoRedo: false,
        appletOnLoad: api => { ggbLin = api; ggbReadyResolve(); }
    };
    const app = new GGBApplet(params, true);
    app.setHTML5Codebase('https://www.geogebra.org/apps/5.2/');
    app.inject('ggb-lineal');
});

async function ggbClear() { await ggbReady; try { ggbLin.evalCommand("Delete[All]"); } catch { } }
async function ggbAddPoints(pts) {
    await ggbReady;
    pts.forEach((p, i) => ggbLin.evalCommand(`P${i + 1}=(${p[0]},${p[1]})`));
}
async function ggbPlotLine(a0, a1) {
    await ggbReady;
    ggbLin.evalCommand(`f(x)=${a1}*x+${a0}`);
    ggbLin.setLineThickness("f", 5);
    ggbLin.setColor("f", 255, 99, 132);
}
async function ggbFit(pts) {
    await ggbReady;
    if (pts.length === 0) return;
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const xmin = Math.min(...xs), xmax = Math.max(...xs);
    const ymin = Math.min(...ys), ymax = Math.max(...ys);
    const padX = (xmax - xmin || 1) * 0.2, padY = (ymax - ymin || 1) * 0.2;
    ggbLin.evalCommand(`ZoomIn[${xmin - padX},${ymin - padY},${xmax + padX},${ymax + padY}]`);
}

// ========== UI ==========
const tbody = document.querySelector("#tabla-puntos tbody");
document.getElementById("agregar-punto").addEventListener("click", () => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><input type="number" step="any" value="0"></td>
                <td><input type="number" step="any" value="0"></td>
                <td><button class="row-del">✕</button></td>`;
    tbody.appendChild(tr);
});
tbody.addEventListener("click", e => {
    if (e.target.classList.contains("row-del")) e.target.closest("tr").remove();
});

function leerPuntos() {
    const pts = [];
    for (const tr of tbody.querySelectorAll("tr")) {
        const x = parseFloat(tr.children[0].querySelector("input").value);
        const y = parseFloat(tr.children[1].querySelector("input").value);
        if (Number.isFinite(x) && Number.isFinite(y)) pts.push([x, y]);
    }
    return pts;
}

document.getElementById("calcular").addEventListener("click", async () => {
    const Puntos = leerPuntos();
    const Tolerancia = parseFloat(document.getElementById("rl-tol").value || "0.8");
    if (Puntos.length < 2) { alert("Ingresá al menos 2 puntos."); return; }

    let res;
    try {
        res = await fetch("/api/RegresionLineal", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Puntos, Tolerancia })
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

    const fx = data.Funcion ?? data.funcion ?? "—";
    const r = Number(data.Correlacion ?? data.correlacion ?? 0);
    const ok = data.EfectividadAjuste ?? data.efectividadAjuste ?? "—";

    document.getElementById("funcion").textContent = fx;
    document.getElementById("correlacion").textContent = r.toFixed(2) + " %";
    document.getElementById("efectividad").textContent = ok;

    const C = data.Coeficientes ?? data.coeficientes ?? [];
    await ggbClear();
    await ggbAddPoints(Puntos);
    if (C.length === 2) await ggbPlotLine(C[0], C[1]);
    await ggbFit(Puntos);
});

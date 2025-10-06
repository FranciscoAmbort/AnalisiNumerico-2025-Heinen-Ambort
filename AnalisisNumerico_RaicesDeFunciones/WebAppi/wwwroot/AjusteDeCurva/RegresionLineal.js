// ===== GeoGebra =====
let ggbLin = null;
document.addEventListener("DOMContentLoaded", () => {
    const params = {
        appName: "graphing",
        width: 900, height: 520,
        showToolBar: false, showAlgebraInput: false, showMenuBar: false,
        perspective: "G", enableUndoRedo: false,
        appletOnLoad: api => (ggbLin = api)
    };
    const app = new GGBApplet(params, true);
    app.setHTML5Codebase('https://www.geogebra.org/apps/5.2/');
    app.inject('ggb-lineal');
});

function ggbClear() { if (ggbLin) try { ggbLin.evalCommand("Delete[All]"); } catch { } }
function ggbAddPoints(pts) {
    if (!ggbLin) return;
    pts.forEach((p, i) => ggbLin.evalCommand(`P${i + 1}=(${p[0]},${p[1]})`));
}
function ggbPlotLine(a0, a1) {
    if (!ggbLin) return;
    ggbLin.evalCommand(`f(x)=${a1}*x+${a0}`);
    ggbLin.setLineThickness("f", 5); ggbLin.setColor("f", 255, 99, 132);
}
function ggbFit(pts) {
    if (!ggbLin || pts.length === 0) return;
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const xmin = Math.min(...xs), xmax = Math.max(...xs);
    const ymin = Math.min(...ys), ymax = Math.max(...ys);
    const padX = (xmax - xmin || 1) * 0.2, padY = (ymax - ymin || 1) * 0.2;
    ggbLin.evalCommand(`ZoomIn[${xmin - padX},${ymin - padY},${xmax + padX},${ymax + padY}]`);
}

// ===== UI =====
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

    const res = await fetch("/api/RegresionLineal", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Puntos, Tolerancia })
    });
    if (!res.ok) { alert(await res.text()); return; }

    const data = await res.json();
    const fx = data.Funcion ?? data.funcion ?? "—";
    const r = data.Correlacion ?? data.correlacion ?? 0;
    const ok = data.EfectividadAjuste ?? data.efectividadAjuste ?? "—";

    document.getElementById("funcion").textContent = fx;
    document.getElementById("correlacion").textContent = Number(r).toFixed(2) + " %";
    document.getElementById("efectividad").textContent = ok;

    // GeoGebra
    const C = data.Coeficientes ?? data.coeficientes ?? [];
    ggbClear();
    ggbAddPoints(Puntos);
    if (C.length === 2) ggbPlotLine(C[0], C[1]);
    ggbFit(Puntos);
});

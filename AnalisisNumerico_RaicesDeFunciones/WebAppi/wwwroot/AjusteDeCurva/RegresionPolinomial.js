// ===== GeoGebra =====
let ggbPoly = null;
document.addEventListener("DOMContentLoaded", () => {
    const params = {
        appName: "graphing",
        width: 900, height: 520,
        showToolBar: false, showAlgebraInput: false, showMenuBar: false,
        perspective: "G", enableUndoRedo: false,
        appletOnLoad: api => (ggbPoly = api)
    };
    const app = new GGBApplet(params, true);
    app.setHTML5Codebase('https://www.geogebra.org/apps/5.2/');
    app.inject('ggb-poly');
});

function ggbClearPoly() { if (ggbPoly) try { ggbPoly.evalCommand("Delete[All]"); } catch { } }
function ggbAddPointsPoly(pts) {
    if (!ggbPoly) return;
    pts.forEach((p, i) => ggbPoly.evalCommand(`P${i + 1}=(${p[0]},${p[1]})`));
}
function ggbPlotPoly(coef) {
    if (!ggbPoly) return;
    // coef = [a0,a1,...,ag]  -> f(x)=...
    const terms = coef.map((a, i) => {
        if (Math.abs(a) < 1e-12) return null;
        if (i === 0) return `${a}`;
        if (i === 1) return `${a}*x`;
        return `${a}*x^${i}`;
    }).filter(Boolean);
    let fx = `f(x)=${terms.join("+")}`.replace(/\+\-/g, "-");
    ggbPoly.evalCommand(fx);
    ggbPoly.setLineThickness("f", 5);
    ggbPoly.setColor("f", 34, 197, 94);
}
function ggbFitPoly(pts) {
    if (!ggbPoly || pts.length === 0) return;
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const xmin = Math.min(...xs), xmax = Math.max(...xs);
    const ymin = Math.min(...ys), ymax = Math.max(...ys);
    const padX = (xmax - xmin || 1) * 0.2, padY = (ymax - ymin || 1) * 0.2;
    ggbPoly.evalCommand(`ZoomIn[${xmin - padX},${ymin - padY},${xmax + padX},${ymax + padY}]`);
}

// ===== UI =====
const tbody = document.getElementById("rp-tbody");
document.getElementById("rp-add").addEventListener("click", () => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><input type="number" step="any" value="0"/></td>
                <td><input type="number" step="any" value="0"/></td>
                <td><button class="row-del">✕</button></td>`;
    tbody.appendChild(tr);
});
tbody.addEventListener("click", (e) => { if (e.target.classList.contains("row-del")) e.target.closest("tr").remove(); });

function leer() {
    const pts = []; for (const tr of tbody.querySelectorAll("tr")) {
        const x = parseFloat(tr.children[0].querySelector("input").value);
        const y = parseFloat(tr.children[1].querySelector("input").value);
        if (Number.isFinite(x) && Number.isFinite(y)) pts.push([x, y]);
    } return pts;
}

const END_POLI = "/api/RegresionPolinomial";
document.getElementById("rp-calc").addEventListener("click", async () => {
    const Puntos = leer();
    const Grado = parseInt(document.getElementById("rp-grado").value || "2");
    const Tolerancia = parseFloat(document.getElementById("rp-tol").value || "0.8");

    if (Puntos.length < Grado + 1) { alert(`Ingresá al menos ${Grado + 1} puntos.`); return; }

    const res = await fetch(END_POLI, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Puntos, Grado, Tolerancia })
    });
    if (!res.ok) { alert(await res.text()); return; }

    const data = await res.json();

    document.getElementById("rp-fx").textContent = data.Funcion ?? "—";
    document.getElementById("rp-r").textContent = (data.Correlacion ?? 0).toFixed(2) + " %";
    document.getElementById("rp-ok").textContent = data.EfectividadAjuste ?? "—";

    // GeoGebra
    const C = data.Coeficientes ?? data.coeficientes ?? [];
    ggbClearPoly();
    ggbAddPointsPoly(Puntos);
    ggbPlotPoly(C);
    ggbFitPoly(Puntos);
});

﻿// ================== GeoGebra ==================
let ggbApp = null, ggb = null;

window.addEventListener("load", function () {
    ggbApp = new GGBApplet({
        appName: "graphing",
        width: 900,
        height: 560,
        showToolBar: false,
        showAlgebraInput: false,
        showMenuBar: false,
        appletOnLoad: function (api) {
            ggb = api;
            try { ggb.setPerspective && ggb.setPerspective("G"); } catch (e) { }
            try { ggb.setGridVisible(true); ggb.setAxesVisible(true, true); } catch (e) { }
            updatePretty();
            console.log("GeoGebra listo");
        }
    }, true);

    ggbApp.inject('ggb-element');
});

// ================== Helpers comunes ==================
function convertirFuncionParaGeoGebra(fx) {
    return String(fx)
        .replace(/Abs/gi, "abs")
        .replace(/Log10/gi, "log10")
        .replace(/Log/gi, "log")
        .replace(/Ln/gi, "ln")
        .replace(/Exp/gi, "exp")
        .replace(/Sen/gi, "sin");
}

// Abs(…) -> |…|, 3*x -> 3x, * -> ·  (para LaTeX)
function toLatexFromInput(fx) {
    let s = String(fx).trim();
    s = s.replace(/Abs\s*\(([^()]+)\)/gi, '\\left|$1\\right|');
    s = s.replace(/\bLn\(/gi, '\\ln(')
        .replace(/\bLog\(/gi, '\\log(')
        .replace(/\bExp\(/gi, '\\exp(');
    s = s.replace(/(\d)\s*\*\s*x/gi, '$1x');
    s = s.replace(/\*/g, '\\cdot ');
    // e^(...)
    s = s.replace(/\be\s*\^\s*\(\s*([^()]+)\s*\)/gi, '\\mathrm{e}^{$1}'); // e^(x+1) -> e^{x+1}
    s = s.replace(/\be\s*\^\s*([a-zA-Z0-9]+)\b/gi, '\\mathrm{e}^{$1}');   // e^x -> e^{x}
    return s;
}

function updatePretty() {
    const raw = document.getElementById('funcion')?.value || '';
    const latex = toLatexFromInput(raw);
    const el = document.getElementById('fx-pretty');
    if (!el) return;
    el.textContent = `\\( ${latex} \\)`;
    if (window.MathJax) { MathJax.typesetPromise([el]); }
}

// números con decimales fijos
function num(n, dec = 6) {
    if (n === null || n === undefined || isNaN(n)) return '-';
    return Number(n).toFixed(dec);
}

// ================== Resultado (tarjetas) ==================
function renderResultado(data, req) {
    const grid = document.getElementById('res-grid');
    if (!grid) return;

    const xr = (data.Xr ?? data.xr);
    const it = (data.iteraciones ?? data.Iteraciones ?? '-');
    const err = data.error;
    const conv = (data.converge ?? data.Converge ?? true);

    grid.innerHTML = `
    <div class="stat"><div class="label">Raíz (xr)</div><div class="value">${num(xr, 6)}</div></div>
    <div class="stat"><div class="label">Iteraciones</div><div class="value">${it}</div></div>
    <div class="stat"><div class="label">Error</div><div class="value">${num(err, 6)}</div></div>
    <div class="stat"><div class="label">Converge</div><div class="value">${String(conv)}</div></div>
    <div class="stat"><div class="label">X₀</div><div class="value">${num(req.Xi, 4)}</div></div>
    <div class="stat"><div class="label">Tolerancia</div><div class="value">${num(req.Tolerancia, 6)}</div></div>
  `;
}

// ================== Graficar ==================
function graficarEnGeoGebra(fx, xr, x0) {
    if (!ggbApp || !ggbApp.getAppletObject) return;
    const api = ggbApp.getAppletObject();
    api.reset();

    try {
        const f = convertirFuncionParaGeoGebra(fx);
        api.evalCommand(`f(x) = ${f}`);

        // punto inicial
        api.evalCommand(`X0 = (${x0}, f(${x0}))`);
        api.setPointSize("X0", 4);
        api.setColor("X0", 0, 0, 255);

        // raíz
        if (xr !== undefined && !isNaN(xr)) {
            api.evalCommand(`A = (${xr}, f(${xr}))`);
            api.setPointSize("A", 6);
            api.setColor("A", 255, 0, 0);
        }

        // encuadre usando f(x0) y f(xr) (si existe)
        const y0 = api.getValue(`f(${x0})`);
        const yr = (xr !== undefined && !isNaN(xr)) ? api.getValue(`f(${xr})`) : y0;
        const yMin = Math.min(y0, yr, 0);
        const yMax = Math.max(y0, yr, 0);
        const yPad = Math.max(1, (yMax - yMin) * 0.2);
        const xLeft = Math.min(x0, (isNaN(xr) ? x0 : xr)) - 2;
        const xRight = Math.max(x0, (isNaN(xr) ? x0 : xr)) + 2;

        api.setCoordSystem(xLeft, xRight, yMin - yPad, yMax + yPad);
    } catch (e) {
        console.error("Error al graficar:", e);
    }
}

// ================== Submit ==================
document.getElementById("form-newtonraphson").addEventListener("submit", async function (e) {
    e.preventDefault();

    const requestData = {
        Funcion: document.getElementById("funcion").value,
        Xi: parseFloat(document.getElementById("xi").value),        // x0
        MaxIteraciones: parseInt(document.getElementById("maxIteraciones").value),
        Tolerancia: parseFloat(document.getElementById("tolerancia").value)
    };

    try {
        const response = await fetch("/api/MetodosAbiertos/newton-raphson", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (!response.ok) {
            renderResultado({ xr: '-', iteraciones: '-', error: data.error || 'Error', converge: false }, requestData);
        } else {
            renderResultado(data, requestData);
            updatePretty(); // refresca f(x) arriba en LaTeX
            graficarEnGeoGebra(requestData.Funcion, (data.Xr ?? data.xr), requestData.Xi);
        }

    } catch (error) {
        console.error(error);
        renderResultado({ xr: '-', iteraciones: '-', error: 'Error de conexión', converge: false }, requestData);
    }
});

// refrescar f(x) mientras escriben
document.getElementById('funcion').addEventListener('input', updatePretty);

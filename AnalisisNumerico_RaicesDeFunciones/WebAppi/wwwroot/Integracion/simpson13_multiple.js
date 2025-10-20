﻿// ✅ 1. Inicializar GeoGebra
let ggbApp = null;
window.addEventListener("load", function () {
    ggbApp = new GGBApplet({
        appName: "graphing",
        width: 800,
        height: 560,
        showToolBar: false,
        showAlgebraInput: false,
        showMenuBar: false,
        appletOnLoad: function (api) {
            console.log("GeoGebra listo para Integración");
        }
    }, true);
    ggbApp.inject('ggb-element');
});

// ✅ 2. Función auxiliar para convertir la expresión
function convertirFuncionParaGeoGebra(fx) {
    let s = String(fx);

    // Convierte e^x a exp(x) para GeoGebra
    s = s.replace(/\be\s*\^\s*\(\s*([^()]+)\s*\)/gi, 'exp($1)');
    s = s.replace(/\be\s*\^\s*([-+]?\s*[^+\-*/()\s]+)/gi, 'exp($1)');

    return s
        .replace(/Abs/gi, "abs")
        .replace(/Log10/gi, "log10")
        .replace(/Log/gi, "ln")
        .replace(/Ln/gi, "ln")
        .replace(/Exp/gi, "exp")
        .replace(/Sen/gi, "sin");
}

// ✅ 3. Función para dibujar la integral
function graficarIntegral(fx, xi, xd) {
    if (!ggbApp || !ggbApp.getAppletObject) {
        return;
    }
    const ggb = ggbApp.getAppletObject();
    ggb.reset();

    try {
        const f = convertirFuncionParaGeoGebra(fx);
        ggb.evalCommand(`f(x) = ${f}`);
        ggb.evalCommand(`integral = Integral(f, ${xi}, ${xd})`);

        ggb.setColor("f", 0, 120, 0);
        ggb.setLineThickness("f", 5);
        ggb.setColor("integral", 34, 197, 94);
        ggb.setFilling("integral", 0.4);

        ggb.evalCommand(`ZoomIn(${xi - 1}, ${-2}, ${xd + 1}, ${10})`);
    } catch (err) {
        console.error("Error al graficar en GeoGebra:", err);
    }
}

// ✅ 4. Función 'calcular' actualizada para Simpson 1/3 Múltiple
async function calcular() {
    const funcion = document.getElementById('funcion').value;
    const xi = parseFloat(document.getElementById('xi').value);
    const xd = parseFloat(document.getElementById('xd').value);
    const n = parseInt(document.getElementById('n').value);
    const resultadoDiv = document.getElementById('area-resultado');

    // El objeto de datos incluye 'n'
    const requestData = { funcion, xi, xd, n };

    try {
        // La URL del endpoint es '/api/integracion/simpson13-multiple'
        const response = await fetch('/api/integracion/simpson13-multiple', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();

        if (response.ok) {
            resultadoDiv.textContent = result.area.toFixed(6);
            // Llamamos a la función para graficar
            graficarIntegral(funcion, xi, xd);
        } else {
            resultadoDiv.textContent = `Error: ${result.error}`;
        }
    } catch (error) {
        resultadoDiv.textContent = 'Error de conexión.';
        console.error('Error en la llamada fetch:', error);
    }
}
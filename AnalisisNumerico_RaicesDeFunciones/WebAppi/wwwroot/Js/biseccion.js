// -------------------- Inicializar GeoGebra --------------------
let ggbApp = null;

window.addEventListener("load", function () {
    ggbApp = new GGBApplet({
        appName: "graphing",
        width: 600,
        height: 400,
        showToolBar: false,
        showAlgebraInput: false,
        showMenuBar: false,
        appletOnLoad: function (api) {
            console.log("GeoGebra listo");
        }
    }, true); // 👈 importante que sea true para cargarlo inmediatamente

    ggbApp.inject('ggb-element'); // este div está en tu HTML
});

// -------------------- Formulario Bisección --------------------
document.getElementById("form-biseccion").addEventListener("submit", async function (e) {
    e.preventDefault();

    const requestData = {
        Funcion: document.getElementById("funcion").value,
        Xi: parseFloat(document.getElementById("xi").value),
        Xd: parseFloat(document.getElementById("xd").value),
        MaxIteraciones: parseInt(document.getElementById("maxIteraciones").value),
        Tolerancia: parseFloat(document.getElementById("tolerancia").value)
    };

    try {
        const response = await fetch("/api/MetodosCerrados/biseccion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (!response.ok) {
            document.getElementById("resultado").textContent = `Error: ${data.error || "Error desconocido"}`;
        } else {
            document.getElementById("resultado").textContent = JSON.stringify(data, null, 2);

            // 👉 Graficar en GeoGebra con los datos de la API
            graficarEnGeoGebra(requestData.Funcion, data.Xr);
        }

    } catch (error) {
        document.getElementById("resultado").textContent = `Error de conexión: ${error}`;
    }
});

// -------------------- Función para graficar --------------------
function graficarEnGeoGebra(fx, raiz) {
    if (!ggbApp || !ggbApp.getAppletObject) {
        console.error("GeoGebra aún no está listo");
        return;
    }

    const ggb = ggbApp.getAppletObject();

    // Limpiar todo antes
    ggb.reset();

    try {
        // Dibujar función
        ggb.evalCommand(`f(x) = ${fx}`);

        // Marcar Xi y Xd
        ggb.evalCommand(`Xi = (${document.getElementById("xi").value}, f(${document.getElementById("xi").value}))`);
        ggb.evalCommand(`Xd = (${document.getElementById("xd").value}, f(${document.getElementById("xd").value}))`);
        ggb.setPointSize("Xi", 4);
        ggb.setPointSize("Xd", 4);
        ggb.setColor("Xi", 0, 0, 255); // azul
        ggb.setColor("Xd", 0, 128, 0); // verde

        // Si hay raíz encontrada, marcarla como punto rojo
        if (raiz !== undefined && !isNaN(raiz)) {
            ggb.evalCommand(`A = (${raiz}, f(${raiz}))`);
            ggb.setPointSize("A", 6);
            ggb.setColor("A", 255, 0, 0); // rojo
        }
    } catch (err) {
        console.error("Error al graficar en GeoGebra:", err);
    }
}

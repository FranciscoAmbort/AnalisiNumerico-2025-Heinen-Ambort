
// Referencias a elementos
const tabla = document.getElementById("tabla-puntos").getElementsByTagName("tbody")[0];
const btnAgregar = document.getElementById("agregar-punto");
const btnCalcular = document.getElementById("calcular");
const canvas = document.getElementById("grafico");
const ctx = canvas.getContext("2d");

// Resultados
const funcionSpan = document.getElementById("funcion");
const correlacionSpan = document.getElementById("correlacion");
const efectividadSpan = document.getElementById("efectividad");

// --- Agregar nueva fila ---
btnAgregar.addEventListener("click", () => {
    let fila = tabla.insertRow();
    let cellX = fila.insertCell(0);
    let cellY = fila.insertCell(1);
    cellX.innerHTML = `<input type="number" value="0">`;
    cellY.innerHTML = `<input type="number" value="0">`;
});

const btnEliminar = document.getElementById("eliminar-punto");

btnEliminar.addEventListener("click", () => {
    let filas = tabla.rows.length;
    if (filas > 2) { // deja al menos 2 filas mínimas
        tabla.deleteRow(filas - 1);
    } else {
        alert("Debe haber al menos dos puntos para interpolar.");
    }
});


// --- Calcular regresión ---
btnCalcular.addEventListener("click", async () => {
    // 1. Tomar puntos
    let puntos = [];
    for (let fila of tabla.rows) {
        let x = parseFloat(fila.cells[0].children[0].value);
        let y = parseFloat(fila.cells[1].children[0].value);
        puntos.push([x, y]);
    }

    // 2. Llamar a backend (ajusta URL a tu API real)
    let response = await fetch("https://localhost:7114/api/RegresionLineal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            Puntos: puntos,
            Tolerancia: 0.05
        })
    });

    let data = await response.json();

    // 3. Mostrar resultados
    funcionSpan.textContent = data.funcion;
    correlacionSpan.textContent = data.correlacion.toFixed(2) + " %";
    efectividadSpan.textContent = data.efectividadAjuste;


});

// --- Función para graficar ---


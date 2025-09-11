function generarMatriz() {
    const size = parseInt(document.getElementById("size").value);
    const container = document.getElementById("matrix");

    container.innerHTML = ""; // limpia contenido anterior

    const tabla = document.createElement("table");
    tabla.classList.add("matriz");

    for (let i = 0; i < size; i++) {
        const fila = document.createElement("tr");

        // Inputs para los coeficientes (A)
        for (let j = 0; j < size; j++) {
            const celda = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `a-${i}-${j}`;
            input.step = "any";
            celda.appendChild(input);
            fila.appendChild(celda);
        }

        // Input para el término independiente (b)
        const celdaTI = document.createElement("td");
        const inputTI = document.createElement("input");
        inputTI.type = "number";
        inputTI.id = `b-${i}`;
        inputTI.step = "any";
        celdaTI.appendChild(inputTI);
        fila.appendChild(celdaTI);

        tabla.appendChild(fila);
    }

    container.appendChild(tabla);
}

function calcular() {
    const size = parseInt(document.getElementById("size").value);
    const A = [];
    const b = [];

    for (let i = 0; i < size; i++) {
        const fila = [];
        for (let j = 0; j < size; j++) {
            const valor = parseFloat(document.getElementById(`a-${i}-${j}`).value) || 0;
            fila.push(valor);
        }
        A.push(fila);

        const terminoIndep = parseFloat(document.getElementById(`b-${i}`).value) || 0;
        b.push(terminoIndep);
    }

    const tolerancia = parseFloat(document.getElementById("tolerance").value);
    const iteraciones = parseInt(document.getElementById("iterations").value);

    const datos = {
        A,
        b,
        tolerancia,
        iteraciones
    };

    const resultado = document.getElementById("resultado");
    resultado.innerHTML = `<p>Calculando...</p>`;

    // 🔁 Petición real al backend
    fetch("https://localhost:7114/api/sistemas/gaussjordan", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    })
        .then(response => {
            if (!response.ok) throw new Error("Error en la respuesta del servidor");
            return response.json();
        })
        .then(solucion => {
            pintarBonitoResultado(solucion, "Gauss-Jordan");
        })
        .catch(error => {
            resultado.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
            console.error("Error al hacer el cálculo:", error);
        });
}
function pintarBonitoResultado(solucion, metodo) {
    // Normalizar: soporta [..] o { resultado: [..] } o un objeto plano
    let arr = Array.isArray(solucion)
        ? solucion
        : (Array.isArray(solucion?.resultado) ? solucion.resultado : Object.values(solucion));

    arr = arr.map(n => Number(n)); // asegurar números

    const resultado = document.getElementById("resultado");
    resultado.innerHTML = `
    <div class="res-card">
      <div class="res-header">
        <span>Resultado del sistema</span>
        <span class="badge">${metodo}</span>
      </div>
      <div class="res-grid">
        ${arr.map((val, idx) => `
          <div class="stat">
            <div class="label">x<sub>${idx + 1}</sub></div>
            <div class="value">${Number.isFinite(val) ? val.toFixed(9) : "-"}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}


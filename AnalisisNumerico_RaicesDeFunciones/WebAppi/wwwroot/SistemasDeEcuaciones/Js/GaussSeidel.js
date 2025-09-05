function generarMatriz() {
    const size = parseInt(document.getElementById("size").value);
    const container = document.getElementById("matrix");

    container.innerHTML = "";

    const tabla = document.createElement("table");
    tabla.classList.add("matriz");

    for (let i = 0; i < size; i++) {
        const fila = document.createElement("tr");

        for (let j = 0; j < size; j++) {
            const celda = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `a-${i}-${j}`;
            input.step = "any";
            celda.appendChild(input);
            fila.appendChild(celda);
        }

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

    const datos = { A, b, tolerancia, iteraciones };

    const resultado = document.getElementById("resultado");
    resultado.innerHTML = `<p>Calculando...</p>`;

    fetch("https://localhost:7114/api/sistemas/gaussseidel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
        .then(response => {
            if (!response.ok) throw new Error("Error en la respuesta del servidor");
            return response.json();
        })
        .then(solucion => {
            resultado.innerHTML = `
            <h4>Resultado:</h4>
            <pre>${JSON.stringify(solucion, null, 2)}</pre>
        `;
        })
        .catch(error => {
            resultado.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
            console.error("Error al calcular Gauss-Seidel:", error);
        });
}

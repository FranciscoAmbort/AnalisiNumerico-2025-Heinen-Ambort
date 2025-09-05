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

    // Mostrar en consola (o enviar al backend)
    console.log("Matriz A:", A);
    console.log("Vector b:", b);
    console.log("Tolerancia:", tolerancia);
    console.log("Iteraciones:", iteraciones);

    // Simulación de respuesta (podés reemplazar esto por un fetch al backend)
    const resultado = document.getElementById("resultado");
    resultado.innerHTML = `
    <p><strong>Ejemplo de cómo se procesaría:</strong></p>
    <pre>${JSON.stringify({ A, b, tolerancia, iteraciones }, null, 2)}</pre>
  `;
}

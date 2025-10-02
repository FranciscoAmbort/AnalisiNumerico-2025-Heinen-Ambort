
document.addEventListener("DOMContentLoaded", function () {
    const addPointBtn = document.getElementById("addPointBtn");
    const calculateBtn = document.getElementById("calculateBtn");
    const tableBody = document.getElementById("pointsTable").querySelector("tbody");

    const funcionEl = document.getElementById("funcion");
    const correlacionEl = document.getElementById("correlacion");
    const ajusteEl = document.getElementById("ajuste");

    let chart;

    addPointBtn.addEventListener("click", () => {
        const row = tableBody.insertRow();
        const cellX = row.insertCell(0);
        const cellY = row.insertCell(1);

        const inputX = document.createElement("input");
        inputX.type = "number";
        inputX.step = "any";

        const inputY = document.createElement("input");
        inputY.type = "number";
        inputY.step = "any";

        cellX.appendChild(inputX);
        cellY.appendChild(inputY);
    });

    calculateBtn.addEventListener("click", () => {
        const puntos = [];

        const rows = tableBody.querySelectorAll("tr");
        for (const row of rows) {
            const x = parseFloat(row.cells[0].querySelector("input").value);
            const y = parseFloat(row.cells[1].querySelector("input").value);

            if (!isNaN(x) && !isNaN(y)) {
                puntos.push([x, y]);
            }
        }

        if (puntos.length < 2) {
            alert("Debe ingresar al menos dos puntos válidos.");
            return;
        }

        fetch("http://localhost:5000/api/regresion-lineal", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ puntos: puntos, tolerancia: 0.8 })
        })
            .then(res => res.json())
            .then(data => {
                funcionEl.textContent = data.funcion;
                correlacionEl.textContent = data.correlacion.toFixed(2) + " %";
                ajusteEl.textContent = data.efectividadAjuste;

                dibujarGrafico(puntos, data.funcion);
            })
            .catch(error => {
                console.error("Error en el cálculo:", error);
            });
    });

    function dibujarGrafico(puntos, funcion) {
        const ctx = document.getElementById("grafico").getContext("2d");

        const xs = puntos.map(p => p[0]);
        const match = funcion.match(/y\s*=\s*([-\d.]+)x\s*([+-])\s*([\d.]+)/);

        let a = 0, b = 0;
        if (match) {
            a = parseFloat(match[1]);
            b = parseFloat(match[3]) * (match[2] === "-" ? -1 : 1);
        }

        const lineData = [];
        const xMin = Math.min(...xs) - 1;
        const xMax = Math.max(...xs) + 1;

        for (let x = xMin; x <= xMax; x += 0.5) {
            lineData.push({ x: x, y: a * x + b });
        }

        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: "scatter",
            data: {
                datasets: [
                    {
                        label: "Puntos",
                        data: puntos.map(p => ({ x: p[0], y: p[1] })),
                        backgroundColor: "blue",
                    },
                    {
                        label: "Ajuste Lineal",
                        type: "line",
                        data: lineData,
                        borderColor: "red",
                        borderWidth: 2,
                        fill: false,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: false,
                scales: {
                    x: { type: "linear", position: "bottom" }
                }
            }
        });
    }
});

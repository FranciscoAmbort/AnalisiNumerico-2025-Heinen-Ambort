document.getElementById("form-secante").addEventListener("submit", async function (e) {
    e.preventDefault();

    const requestData = {
        Funcion: document.getElementById("funcion").value,
        Xi: parseFloat(document.getElementById("xi").value),
        Xd: parseFloat(document.getElementById("xd").value),
        MaxIteraciones: parseInt(document.getElementById("maxIteraciones").value),
        Tolerancia: parseFloat(document.getElementById("tolerancia").value)
    };

    try {
        const response = await fetch("/api/MetodosAbiertos/secante", {
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
        }

    } catch (error) {
        document.getElementById("resultado").textContent = `Error de conexión: ${error}`;
    }
});

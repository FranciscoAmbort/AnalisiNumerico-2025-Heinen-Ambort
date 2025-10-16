// wwwroot/Integracion/simpson13_simple.js
async function calcular() {
    const requestData = {
        funcion: document.getElementById('funcion').value,
        xi: parseFloat(document.getElementById('xi').value),
        xd: parseFloat(document.getElementById('xd').value)
    };
    const resultadoInput = document.getElementById('area');

    try {
        const response = await fetch('/api/integracion/simpson13-simple', { // <-- URL actualizada
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });
        const result = await response.json();
        resultadoInput.value = response.ok ? result.area : `Error: ${result.error}`;
    } catch (error) {
        resultadoInput.value = 'No se pudo conectar con el servidor.';
    }
}
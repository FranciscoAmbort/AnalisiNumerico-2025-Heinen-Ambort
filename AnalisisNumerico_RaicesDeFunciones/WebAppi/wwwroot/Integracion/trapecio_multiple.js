// wwwroot/Integracion/trapecio_multiple.js
async function calcular() {
    // 1. Obtenemos los datos, incluyendo 'n'
    const funcion = document.getElementById('funcion').value;
    const xi = parseFloat(document.getElementById('xi').value);
    const xd = parseFloat(document.getElementById('xd').value);
    const n = parseInt(document.getElementById('n').value); // Leemos el nuevo valor
    const resultadoInput = document.getElementById('area');

    // 2. Creamos el objeto 'request' con los cuatro campos
    const requestData = {
        funcion: funcion,
        xi: xi,
        xd: xd,
        n: n // Añadimos 'n' al objeto
    };

    // 3. Hacemos la llamada a la nueva URL de la API
    try {
        const response = await fetch('/api/integracion/trapecio-multiple', { // <-- URL actualizada
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();

        if (response.ok) {
            resultadoInput.value = result.area;
        } else {
            resultadoInput.value = `Error: ${result.error}`;
        }

    } catch (error) {
        resultadoInput.value = 'No se pudo conectar con el servidor.';
        console.error('Error en la llamada fetch:', error);
    }
}
// wwwroot/Integracion/trapecio.js
async function calcular() {
    // 1. Obtenemos los datos de la interfaz
    const funcion = document.getElementById('funcion').value;
    const xi = parseFloat(document.getElementById('xi').value);
    const xd = parseFloat(document.getElementById('xd').value);
    const resultadoInput = document.getElementById('area');

    // 2. Creamos el objeto 'request' que espera nuestra API
    const requestData = {
        funcion: funcion,
        xi: xi,
        xd: xd
    };

    // 3. Hacemos la llamada a la API usando fetch
    try {
        const response = await fetch('/api/integracion/trapecio-simple', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();

        if (response.ok) {
            // Si la respuesta es exitosa (200 OK)
            resultadoInput.value = result.area;
        } else {
            // Si la API devuelve un error (400 Bad Request)
            resultadoInput.value = `Error: ${result.error}`;
        }

    } catch (error) {
        // Por si hay un error de red o el servidor no responde
        resultadoInput.value = 'No se pudo conectar con el servidor.';
        console.error('Error en la llamada fetch:', error);
    }
}
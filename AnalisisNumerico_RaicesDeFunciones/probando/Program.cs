using Calculus;

double fx, area;
Calculo AnalizadorDeFunciones = new Calculo();

if (AnalizadorDeFunciones.Sintaxis("2*x+2", 'x')) //pasamos la funcion con la variable a evaluar
{
    fx = AnalizadorDeFunciones.EvaluaFx(2.3);
    area = AnalizadorDeFunciones.Integra(2, 5, 0.0003);

    Console.WriteLine("f(2.3)={0}    Area={1}", fx, area);

}
else
{
    // aquí mensaje de error en sintaxis
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Calculus;

namespace AnalisisNumerico_RaicesDeFunciones
{
    public static class MetodosCerrados
    {
        public static MetodoCerradoResultado Biseccion (string fx, int maxiteraciones, double tolerancia)
        {
            var result = new MetodoCerradoResultado { Metodo = "Biseccion"};
            Calculo calculo = new Calculo();

            while (!calculo.Sintaxis(fx, 'x'))
            {
                Console.WriteLine("Error en la sintaxis de la función. Ingresá de nuevo:");
                fx = Console.ReadLine();
            }

            result.Funcion = fx;

            double xi, xd, fxi, fxd; 

            while (true)
            {
                Console.Write("Ingresá xi: ");
                xi = double.Parse(Console.ReadLine());

                Console.Write("Ingresá xd: ");
                xd = double.Parse(Console.ReadLine());

                fxi = calculo.EvaluaFx(xi);
                fxd = calculo.EvaluaFx(xd);

                if (fxi * fxd < 0)
                    break;

                Console.WriteLine("No hay cambio de signo. Probá con otro intervalo.\n");
            }

            if (fxi * fxd == 0)
            {
                result.Iteraciones = 1;
                result.Error = 1;
                result.Converge = true;
                if (fxi == 0)
                {
                    result.Xr = xi;   
                }else
                {
                    result.Xr = xd;
                }
                return result;
            }else 
            {
                double xrAnterior = xi; //pregutar a profe
                double xr = 0;
                double error = 0;

                for (int i = 1; i < maxiteraciones; i++)
                {
                    xr = 0.5 * (xi + xd);
                    error = Math.Abs((xr - xrAnterior)/ xr);
                    double fxr = calculo.EvaluaFx(xr);
                    if (Math.Abs(fxr) < tolerancia || error < tolerancia)
                    {
                        result.Xr = xr;
                        result.Iteraciones = i;
                        result.Error = error;
                        result.Converge = true;
                        return result;
                    }
                    else
                    {
                        if (calculo.EvaluaFx(xi)*fxr < 0)
                        {
                            xi = xr;
                        }
                        else
                        {
                            xd = xr;
                        }
                        xrAnterior = xr;
                    }
                }
                result.Xr = xr;
                result.Iteraciones = maxiteraciones;
                result.Error = error;
                result.Converge = false;
                return result;
            }
        }
    }
}

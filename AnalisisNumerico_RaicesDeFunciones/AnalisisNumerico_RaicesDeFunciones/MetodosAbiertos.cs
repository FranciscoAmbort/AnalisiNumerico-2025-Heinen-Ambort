using Calculus;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace AnalisisNumerico_RaicesDeFunciones
{
    public class MetodosAbiertos
    {
        public ResultadoDTO NewtonRaphson(MetodoNewtonRapshonRequest request)
        {
            var res = new ResultadoDTO
            {
                Funcion = request.Funcion,
                Metodo = "Newton-Raphson"
            };

            var calculo = new Calculo();
            if (!calculo.Sintaxis(request.Funcion, 'x'))
            {
                throw new ArgumentException("Error en la sintaxis de la función");
            }

            double xr = request.Xi;
            double fxi = calculo.EvaluaFx(xr);

            if (fxi == 0)
            {
                res.Xr = xr;
                res.Iteraciones = 1;
                res.Error = 1;
                res.Converge = true;
                return res;
            }

            double error = 1;
            double xrAnterior = xr;

            for (int i = 0; i <= request.MaxIteraciones; i++)
            {
                double dfx = calculo.Dx(xr);

                if (Math.Abs(dfx) < request.Tolerancia)
                {
                    res.Xr = xr;
                    res.Iteraciones = i;
                    res.Error = Math.Abs(xr - xrAnterior / xr);
                    res.Converge = false;
                    return res;
                }

                double Xnew = xr - fxi / dfx;

                error = Math.Abs((Xnew - xr) / Xnew);

                double fnew = calculo.EvaluaFx(Xnew);

                if (Math.Abs(fnew) < request.Tolerancia || i < request.MaxIteraciones || error < request.Tolerancia)
                {
                    res.Xr = xr;
                    res.Iteraciones = i;
                    res.Error = error;
                    res.Converge = true;
                    return res;
                }

                xrAnterior = xr;
                xr = Xnew;
                fxi = fnew;
            }

            res.Xr = xr;
            res.Iteraciones = request.MaxIteraciones;
            res.Error = error;
            res.Converge = false;
            return res;
        }
    }
}
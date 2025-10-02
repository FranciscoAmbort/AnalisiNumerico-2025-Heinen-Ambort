using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AnalisisNumerico_AjusteDeCurva
{
    public class RegresionLinealService
    {
        public RegresionLinealResultado Calcular(RegresionLinealRequest request)
        {
            var puntos = request.Puntos;
            var tolerancia = request.Tolerancia;

            int n = puntos.Count;
            double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

            foreach (var punto in puntos)
            {
                double x = punto[0];
                double y = punto[1];
                sumX += x;
                sumY += y;
                sumXY += x * y;
                sumX2 += x * x;
                sumY2 += y * y;
            }

            double a1 = (n * sumXY - sumX * sumY) / (n * sumX2 - (sumX * sumX));
            double a0 = (sumY - a1 * sumX) / n;

            double st = 0, sr = 0;
            foreach (var punto in puntos)
            {
                double x = punto[0];
                double y = punto[1];
                double yEstimada = a1 * x + a0;
                st += Math.Pow(y - (sumY / n), 2);
                sr += Math.Pow(y - yEstimada, 2);
            }

            double r = Math.Sqrt((st - sr) / st) * 100;

            return new RegresionLinealResultado
            {
                Funcion = $"y = {a1:F4}x {(a0 >= 0 ? "+" : "-")} {Math.Abs(a0):F4}",
                Correlacion = r,
                EfectividadAjuste = r >= tolerancia * 100
                    ? "El ajuste es aceptable"
                    : "El ajuste no es aceptable"
            };
        }
    }
}

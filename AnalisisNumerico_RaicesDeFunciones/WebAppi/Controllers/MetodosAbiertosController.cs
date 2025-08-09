using AnalisisNumerico_RaicesDeFunciones;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WebAppi.Controllers
{
    public class MetodosAbiertosController : Controller
    {
        private readonly MetodosAbiertos _service;

        public MetodosAbiertosController (MetodosAbiertos service)
        {
            _service = service;
        }

        [HttpPost("newtonRaphson")]
        public ActionResult<ResultadoDTO> NewtonPaphson([FromBody] MetodoNewtonRapshonRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var resultado = _service.NewtonRaphson(request);
                return Ok(resultado);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { error = "Error interno del servidor" });
            }
        }

    }
}

using AnalisisNumerico_AjusteDeCurva;
using Microsoft.AspNetCore.Mvc;

namespace WebAppi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegresionLinealController : Controller
    {
        private readonly RegresionLinealService _service;

        public RegresionLinealController(RegresionLinealService service)
        {
            _service = service;
        }

        [HttpPost]
        public ActionResult<RegresionLinealResultado> Calcular([FromBody] RegresionLinealRequest request)
        {
            if (!ModelState.IsValid || request.Puntos == null || request.Puntos.Count < 2)
            {
                return BadRequest("La entrada no es válida. Se requieren al menos dos puntos.");
            }

            try
            {
                var resultado = _service.Calcular(request);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}


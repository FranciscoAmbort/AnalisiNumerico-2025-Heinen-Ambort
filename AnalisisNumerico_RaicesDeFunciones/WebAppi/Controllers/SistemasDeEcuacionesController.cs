using AnalisisNumerico_SistemasDeEcuaciones;
using Microsoft.AspNetCore.Mvc;

namespace WebAppi.Controllers
{
    [ApiController]
    [Route("api/sistemas")]
    public class SistemasEcuacionesController : ControllerBase
    {
        [HttpPost("gaussjordan")]
        public ActionResult<double[]> ResolverGaussJordan([FromBody] RequestGaussJordan request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var resultado = GaussJordan.Resolver(request);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}


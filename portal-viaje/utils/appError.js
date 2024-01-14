// heredo de la clase Error de JS para poder usar el metodo captureStackTrace y poder saber en que punto del codigo se produjo el error (para debuggear)

class appError extends Error {
  constructor(message, statusCode) {
    // super solo recibe un argumento que es el mensaje de error (el cual se lo pasamos a la clase Error de JS) y el resto de argumentos que le pasemos se los va a ignorar
    super(message);
    this.statusCode = statusCode;
    // Para saber si el error es operacional o no (si es operacional es un error que nosotros podemos manejar) (si no es operacional es un error de programacion o un bug)
    // si es 400 o 500 es un error operacional (400 es un error del cliente y 500 es un error del servidor)
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    // Para saber si el error es operacional o no
    this.isOperational = true;
    // Para saber en que punto del codigo se produjo el error
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = appError;

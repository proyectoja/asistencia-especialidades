export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método no permitido');

  const { id, nombre, correo, edad, telefono, asociacion } = req.body;
  const fecha = new Date().toISOString();
  const nuevoRegistro = { nombre, correo, edad, telefono, asociacion, fecha };

  const archivo = `respuestas/${id}/respuestas.json`;

  // Verificar si ya existe el archivo
  const response = await fetch(`https://api.github.com/repos/proyectoja/asistencia-especialidades/contents/${archivo}`, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  let contenidoExistente = [];
  let sha = null;

  if (response.ok) {
    const data = await response.json();
    const decoded = Buffer.from(data.content, 'base64').toString();
    contenidoExistente = JSON.parse(decoded);
    sha = data.sha;
  }

  // Agregar la nueva entrada
  contenidoExistente.push(nuevoRegistro);
  const nuevoContenido = Buffer.from(JSON.stringify(contenidoExistente, null, 2)).toString('base64');

  const guardar = await fetch(`https://api.github.com/repos/proyectoja/asistencia-especialidades/contents/${archivo}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `Nuevo registro en ${archivo}`,
      content: nuevoContenido,
      branch: 'main',
      ...(sha && { sha }) // se incluye solo si ya existe
    })
  });

  if (guardar.ok) {
    res.status(200).send("✅ Respuesta guardada en respuestas.json");
  } else {
    const error = await guardar.json();
    res.status(500).send("❌ Error al guardar: " + JSON.stringify(error));
  }
}

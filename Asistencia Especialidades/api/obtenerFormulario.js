export default async function handler(req, res) {
  const { id } = req.query;
  const archivoURL = "https://raw.githubusercontent.com/proyectoja/asistencia-especialidades/refs/heads/main/Asistencia%20Especialidades/data/formularios.json";

  try {
    const response = await fetch(archivoURL);
    const data = await response.json();

    if (!data[id]) {
      return res.status(404).json({ error: "Formulario no encontrado" });
    }

    const fechaCierre = new Date(data[id].fechaCierre);
    const ahora = new Date();
    const estado = ahora > fechaCierre ? "cerrado" : "abierto";

    return res.status(200).json({ ...data[id], estado });
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener el formulario", detalle: err.message });
  }
}

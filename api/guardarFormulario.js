export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send("Método no permitido");
  
    const { id, titulo, fechaCierre } = req.body;
  
    const archivo = `data/formularios.json`;
    const repo = "proyectoja/asistencia-especialidades";
  
    try {
      // Obtener archivo actual
      const resp = await fetch(`https://api.github.com/repos/${repo}/contents/${archivo}`, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
  
      let data = {};
      let sha = null;
  
      if (resp.ok) {
        const archivoJson = await resp.json();
        const contenido = Buffer.from(archivoJson.content, "base64").toString();
        data = JSON.parse(contenido);
        sha = archivoJson.sha;
      }
  
      // Agregar nuevo formulario
      data[id] = { titulo, fechaCierre };
      const nuevoContenido = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
  
      // Guardar en GitHub
      const guardar = await fetch(`https://api.github.com/repos/${repo}/contents/${archivo}`, {
        method: "PUT",
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Formulario creado: ${id}`,
          content: nuevoContenido,
          branch: "main",
          ...(sha && { sha }),
        }),
      });
  
      if (guardar.ok) {
        res.status(200).json({ ok: true });
      } else {
        const error = await guardar.json();
        res.status(500).json({ error: error.message || "Error al guardar" });
      }
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  
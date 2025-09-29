const csv = require("csv-parser");
const xlsx = require("xlsx");
const fs = require('fs');

exports.create = async (req, res) => {
    try {
        const filePath = req.file.path;
        if (!filePath) res.status(400).json({ error: "No se encontró ninguna ruta" })
        const ext = req.file.originalname.split('.').pop().toLowerCase();

        if (ext === "csv"){ // si es un csv

            const results = [];
            const final = [];
            let tiempoSplit1 = [];
            let fechaSplit = [];
            let horaSplit = [];
            let count = 0;
            let intArrayFecha;
            let intArrayHora;

            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            const dateSplit = formattedDate.split("-").map(str => parseInt(str));
            const checadorId = (dateSplit[0]*10000)+(dateSplit[1]*100)+dateSplit[2]-1;

            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(normalizeRow(data)))
                .on('end', () => {
                    fs.unlinkSync(filePath); // borrar archivo temporal

                    results.forEach(e => {
                        count++;
                        tiempoSplit1 = e.Tiempo.split(" ");
                        fechaSplit = tiempoSplit1[0].split("/");
                        intArrayFecha = fechaSplit.map(str => parseInt(str));
                        horaSplit = tiempoSplit1[1].split(":");
                        intArrayHora = horaSplit.map(str => parseInt(str));
                        if(tiempoSplit1[2]=="p.") horaSplit[0] = intArrayHora[0]+12;

                        let value = [
                            {
                                id: count,
                                ImportacionChecadorId: checadorId,
                                UsuarioChecadorID: parseInt(e.Numero),
                                UsuarioChecador: e.Nombre,
                                Tiempo: fechaSplit[2]+"-"+fechaSplit[1]+"-"+fechaSplit[0]+" "+horaSplit[0]+":"+horaSplit[1]+":"+horaSplit[2],
                                Estado: e.Estado,
                                Dispositivos: e.Dispositivos,
                                TipoRegistro: parseInt(e.Tipo_de_Registro),
                                IdFechaDim: (intArrayFecha[2]*10000)+(intArrayFecha[1]*100)+intArrayFecha[0],
                                IdHoraDim: (intArrayHora[0]*10000)+(intArrayHora[1]*100)+intArrayHora[2]
                            }
                        ]
                        final.push(value);
                    });

                    res.json(final);
            });

        }else if (ext === "xls" || ext === "xlsx"){ // si es un xls o xlsx
            
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
            fs.unlinkSync(filePath); // borrar archivo temporal
            res.json(jsonData);

        }else { // si es cualquier otro tipo de arvhico
            fs.unlinkSync(filePath); // borrar archivo temporal
            res.status(400).json({ error: "Formato no soportado. Usa CSV o XLS/XLSX" })
        }
        
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

// 🔹 Función para limpiar y normalizar claves y valores
const normalizeRow = (row) => {
  const cleanRow = {};
  for (const key in row) {
    // Normalizar la clave: quitar espacios y acentos
    const cleanKey = key
      .trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // elimina acentos
      .replace(/\s+/g, '_'); // reemplaza espacios por _
      //.toLowerCase(); // opcional: pasa a minúsculas

    // Normalizar el valor: trim y quitar acentos
    let value = row[key];
    //if (typeof value === 'string') {
    //  value = value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    //}

    cleanRow[cleanKey] = value;
  }
  return cleanRow;
};

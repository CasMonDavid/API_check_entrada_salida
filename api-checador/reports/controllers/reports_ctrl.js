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
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                fs.unlinkSync(filePath); // borrar archivo temporal
                res.json(results);
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
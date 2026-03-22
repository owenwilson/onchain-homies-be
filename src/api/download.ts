// En api/download.ts
import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

router.get('/:filename', (req, res) => {
    const filePath = path.join(process.cwd(), 'temp', req.params.filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath, 'project.zip', (err) => {
            if (err) console.error('Download error:', err);
            // Limpiar después de enviar
            setTimeout(() => fs.unlinkSync(filePath), 5000);
        });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

export default router;
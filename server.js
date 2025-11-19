const express = require('express');
const multer = require('multer');
const yauzl = require('yauzl');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

// Configure multer for file uploads
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Serve static files from frontend directory
app.use(express.static('frontend'));

// Root route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// API endpoint to handle ZIP file upload
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.file.originalname.endsWith('.zip')) {
        return res.status(400).json({ error: 'File must be a ZIP archive' });
    }

    // Parse ZIP file from buffer
    yauzl.fromBuffer(req.file.buffer, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
            console.error('Error opening ZIP:', err);
            return res.status(400).json({ error: 'Failed to open ZIP file: ' + err.message });
        }

        const tree = {
            name: 'root',
            path: '',
            isDirectory: true,
            children: []
        };

        const pathMap = new Map();
        pathMap.set('', tree);

        zipfile.on('entry', (entry) => {
            if (/\/$/.test(entry.fileName)) {
                // Directory entry
                const dirPath = entry.fileName.slice(0, -1);
                ensurePath(dirPath, true);
            } else {
                // File entry
                ensurePath(entry.fileName, false);
            }
        });

        zipfile.on('end', () => {
            res.json(tree);
        });

        zipfile.on('error', (err) => {
            console.error('Error reading ZIP:', err);
            res.status(500).json({ error: 'Error reading ZIP file: ' + err.message });
        });

        zipfile.readEntry();

        function ensurePath(filePath, isDir) {
            const parts = filePath.split('/').filter(p => p.length > 0);
            let currentPath = '';
            let currentNode = tree;

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                const isLast = i === parts.length - 1;
                const isDirectory = isLast ? isDir : true;
                
                currentPath = currentPath ? currentPath + '/' + part : part;
                
                if (!pathMap.has(currentPath)) {
                    const newNode = {
                        name: part,
                        path: currentPath,
                        isDirectory: isDirectory,
                        children: []
                    };
                    currentNode.children.push(newNode);
                    pathMap.set(currentPath, newNode);
                }
                
                currentNode = pathMap.get(currentPath);
            }
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log('========================================');
    console.log('ZIP Tree Visualizer Server');
    console.log('========================================');
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Open your browser and navigate to the URL above');
    console.log('Press Ctrl+C to stop the server');
    console.log('========================================');
});


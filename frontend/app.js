// Configuration
const MAX_FILE_SIZE = Infinity; // No limit
const MAX_IMAGE_DIMENSION = 4096; // Maximum width/height for images
const IMAGE_QUALITY_JPG = 0.85; // JPG quality (0-1)
const IMAGE_QUALITY_PNG = 0.9; // PNG quality

// DOM elements
const fileInput = document.getElementById('fileInput');
const uploadBox = document.getElementById('uploadBox');
const treeSection = document.getElementById('treeSection');
const treeContainer = document.getElementById('treeContainer');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const fileName = document.getElementById('fileName');
const exportJpg = document.getElementById('exportJpg');
const exportPng = document.getElementById('exportPng');
const exportPdf = document.getElementById('exportPdf');

// Store current ZIP filename for root folder name
let currentZipFileName = '';

// File input change handler
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileUpload(e.target.files[0]);
    }
});

// Drag and drop handlers
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('drag-over');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('drag-over');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('drag-over');
    
    if (e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.name.endsWith('.zip')) {
            handleFileUpload(file);
        } else {
            showError('Please upload a ZIP file');
        }
    }
});

// Handle file upload - process ZIP file directly in browser
async function handleFileUpload(file) {
    hideError();
    fileName.textContent = `Selected: ${file.name}`;
    loading.style.display = 'block';
    treeSection.style.display = 'none';
    
    try {
        // Check if JSZip is available
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip library not loaded. Please refresh the page.');
        }
        
        // Store ZIP filename for root folder name
        currentZipFileName = file.name.replace(/\.zip$/i, '') || 'zip-tree';
        
        // Read file as array buffer with progress
        loading.querySelector('p').textContent = `Reading ZIP file... (${(file.size / 1024 / 1024).toFixed(2)}MB)`;
        let arrayBuffer;
        try {
            arrayBuffer = await file.arrayBuffer();
        } catch (err) {
            throw new Error('Failed to read file. The file may be corrupted or too large.');
        }
        
        // Load ZIP file
        loading.querySelector('p').textContent = 'Parsing ZIP structure...';
        let zip;
        try {
            zip = await JSZip.loadAsync(arrayBuffer);
        } catch (err) {
            if (err.message && err.message.includes('corrupt')) {
                throw new Error('ZIP file appears to be corrupted or invalid.');
            } else if (err.message && err.message.includes('format')) {
                throw new Error('Invalid ZIP file format.');
            } else {
                throw new Error('Failed to parse ZIP file. It may be corrupted or use an unsupported format.');
            }
        }
        
        if (!zip || Object.keys(zip.files).length === 0) {
            throw new Error('ZIP file appears to be empty.');
        }
        
        // Build tree structure
        const tree = {
            name: currentZipFileName,
            path: '',
            isDirectory: true,
            children: []
        };
        
        const pathMap = new Map();
        pathMap.set('', tree);
        
        // Process all files in ZIP
        let fileCount = 0;
        const totalFiles = Object.keys(zip.files).length;
        
        for (const [filePath, zipEntry] of Object.entries(zip.files)) {
            if (!filePath) continue;
            
            fileCount++;
            if (fileCount % 100 === 0) {
                loading.querySelector('p').textContent = `Processing files... (${fileCount}/${totalFiles})`;
                // Allow UI to update
                await new Promise(resolve => setTimeout(resolve, 0));
            }
            
            // Skip if it's a directory marker (ends with /)
            const isDirectory = filePath.endsWith('/');
            const cleanPath = isDirectory ? filePath.slice(0, -1) : filePath;
            const parts = cleanPath.split('/').filter(p => p.length > 0);
            
            if (parts.length === 0) continue;
            
            let currentPath = '';
            let currentNode = tree;
            
            // Build path structure
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                const isLast = i === parts.length - 1;
                const nodeIsDir = isLast ? isDirectory : true;
                
                currentPath = currentPath ? currentPath + '/' + part : part;
                
                if (!pathMap.has(currentPath)) {
                    const newNode = {
                        name: part,
                        path: currentPath,
                        isDirectory: nodeIsDir,
                        children: []
                    };
                    currentNode.children.push(newNode);
                    pathMap.set(currentPath, newNode);
                }
                
                currentNode = pathMap.get(currentPath);
            }
        }
        
        // Sort children (directories first, then files, both alphabetically)
        function sortTree(node) {
            if (node.children) {
                node.children.sort((a, b) => {
                    if (a.isDirectory && !b.isDirectory) return -1;
                    if (!a.isDirectory && b.isDirectory) return 1;
                    return a.name.localeCompare(b.name);
                });
                node.children.forEach(sortTree);
            }
        }
        sortTree(tree);
        
        renderTree(tree);
        loading.style.display = 'none';
        treeSection.style.display = 'block';
        
    } catch (err) {
        loading.style.display = 'none';
        showError('Error: ' + err.message);
        console.error('Error processing ZIP:', err);
    }
}

// Render tree structure
function renderTree(node) {
    treeContainer.innerHTML = '';
    const treeDiv = document.createElement('div');
    treeDiv.className = 'tree';
    renderTreeNode(treeDiv, node, '', true);
    treeContainer.appendChild(treeDiv);
}

function renderTreeNode(parent, node, prefix, isLast) {
    const item = document.createElement('div');
    item.className = 'tree-item';
    
    const connector = document.createElement('span');
    connector.className = 'tree-connector';
    connector.textContent = prefix + (isLast ? '└── ' : '├── ');
    item.appendChild(connector);
    
    const icon = document.createElement('span');
    icon.className = 'tree-icon';
    icon.textContent = node.isDirectory ? '📁' : '📄';
    item.appendChild(icon);
    
    const name = document.createElement('span');
    name.className = node.isDirectory ? 'tree-folder' : 'tree-file';
    name.textContent = node.name;
    item.appendChild(name);
    
    parent.appendChild(item);
    
    if (node.children && node.children.length > 0) {
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        node.children.forEach((child, index) => {
            const childIsLast = index === node.children.length - 1;
            renderTreeNode(parent, child, newPrefix, childIsLast);
        });
    }
}

// Export functions
exportJpg.addEventListener('click', () => exportImage('jpg'));
exportPng.addEventListener('click', () => exportImage('png'));
exportPdf.addEventListener('click', () => exportPdfFile());

async function exportImage(format) {
    try {
        if (typeof html2canvas === 'undefined') {
            showError('html2canvas library not loaded. Please refresh the page.');
            return;
        }
        
        // Show loading
        loading.style.display = 'block';
        loading.querySelector('p').textContent = `Generating ${format.toUpperCase()} image...`;
        
        const treeElement = treeContainer;
        
        // Calculate optimal scale based on container size
        const containerWidth = treeElement.scrollWidth;
        const containerHeight = treeElement.scrollHeight;
        const maxDimension = Math.max(containerWidth, containerHeight);
        const scale = Math.min(2, MAX_IMAGE_DIMENSION / maxDimension);
        
        html2canvas(treeElement, {
            backgroundColor: '#f8f9fa',
            scale: scale,
            logging: false,
            useCORS: true,
            width: containerWidth,
            height: containerHeight,
            windowWidth: containerWidth,
            windowHeight: containerHeight
        }).then(canvas => {
            // Reduce canvas size if too large
            let finalCanvas = canvas;
            if (canvas.width > MAX_IMAGE_DIMENSION || canvas.height > MAX_IMAGE_DIMENSION) {
                finalCanvas = resizeCanvas(canvas, MAX_IMAGE_DIMENSION);
            }
            
            // Convert to blob and verify integrity
            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
            const quality = format === 'jpg' ? IMAGE_QUALITY_JPG : IMAGE_QUALITY_PNG;
            
            finalCanvas.toBlob((blob) => {
                if (!blob) {
                    loading.style.display = 'none';
                    showError('Failed to create image blob. The image may be too large.');
                    return;
                }
                
                // Verify blob integrity
                if (blob.size === 0) {
                    loading.style.display = 'none';
                    showError('Generated image is empty. Please try again.');
                    return;
                }
                
                // Create object URL and verify it works
                const url = URL.createObjectURL(blob);
                const img = new Image();
                
                img.onload = () => {
                    // Image loaded successfully - integrity check passed
                    const link = document.createElement('a');
                    link.download = `${currentZipFileName || 'project'}-tree.${format}`;
                    link.href = url;
                    
                    // Trigger download
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // Clean up
                    setTimeout(() => URL.revokeObjectURL(url), 100);
                    loading.style.display = 'none';
                };
                
                img.onerror = () => {
                    loading.style.display = 'none';
                    URL.revokeObjectURL(url);
                    showError('Generated image is corrupted. Please try again.');
                };
                
                img.src = url;
                
            }, mimeType, quality);
            
        }).catch(err => {
            loading.style.display = 'none';
            showError('Failed to export image: ' + err.message);
            console.error('Export error:', err);
        });
    } catch (err) {
        loading.style.display = 'none';
        showError('Failed to export image: ' + err.message);
        console.error('Export error:', err);
    }
}

function resizeCanvas(canvas, maxDimension) {
    let width = canvas.width;
    let height = canvas.height;
    
    if (width > maxDimension || height > maxDimension) {
        if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
        } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
        }
    }
    
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = width;
    resizedCanvas.height = height;
    const ctx = resizedCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, width, height);
    
    return resizedCanvas;
}

async function exportPdfFile() {
    try {
        // Check if libraries are loaded
        if (typeof window === 'undefined' || !window.jspdf) {
            showError('jsPDF library not loaded. Please refresh the page.');
            return;
        }
        
        if (typeof html2canvas === 'undefined') {
            showError('html2canvas library not loaded. Please refresh the page.');
            return;
        }
        
        // Show loading
        loading.style.display = 'block';
        loading.querySelector('p').textContent = 'Generating PDF...';
        
        const treeElement = treeContainer;
        
        // Wait a bit to ensure jsPDF is fully loaded
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Access jsPDF from window.jspdf
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            loading.style.display = 'none';
            showError('jsPDF class not found. Please refresh the page.');
            return;
        }
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Calculate dimensions
        const containerWidth = treeElement.scrollWidth;
        const containerHeight = treeElement.scrollHeight;
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pdfWidth - (margin * 2);
        const contentHeight = pdfHeight - (margin * 2);
        
        // Calculate optimal scale - ensure good quality
        const pxToMm = 0.264583;
        const maxWidthMm = contentWidth;
        const maxHeightMm = contentHeight;
        const containerWidthMm = containerWidth * pxToMm;
        const containerHeightMm = containerHeight * pxToMm;
        
        let imgWidth = containerWidthMm;
        let imgHeight = containerHeightMm;
        
        // Scale down if too large
        if (imgWidth > maxWidthMm || imgHeight > maxHeightMm) {
            const scaleX = maxWidthMm / imgWidth;
            const scaleY = maxHeightMm / imgHeight;
            const scale = Math.min(scaleX, scaleY);
            imgWidth *= scale;
            imgHeight *= scale;
        }
        
        // Calculate scale for html2canvas (higher quality)
        const canvasScale = Math.min(2, Math.max(1, (imgWidth / containerWidthMm) * 2));
        
        html2canvas(treeElement, {
            backgroundColor: '#f8f9fa',
            scale: canvasScale,
            logging: false,
            useCORS: true,
            width: containerWidth,
            height: containerHeight,
            allowTaint: false
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png', 0.95);
            
            // Verify image data
            if (!imgData || imgData === 'data:,') {
                loading.style.display = 'none';
                showError('Failed to generate image data for PDF.');
                return;
            }
            
            // Check if image fits on one page
            const needsMultiplePages = imgHeight > maxHeightMm;
            
            if (needsMultiplePages) {
                // Multi-page PDF
                const pageHeight = pdfHeight - (margin * 2);
                let yPosition = margin;
                let sourceY = 0;
                const sourceHeight = canvas.height;
                const pageWidth = pdfWidth - (margin * 2);
                
                while (sourceY < sourceHeight) {
                    // Create a temporary canvas for this page
                    const pageCanvas = document.createElement('canvas');
                    pageCanvas.width = canvas.width;
                    pageCanvas.height = Math.min(pageHeight / pxToMm, sourceHeight - sourceY);
                    const pageCtx = pageCanvas.getContext('2d');
                    pageCtx.drawImage(canvas, 0, sourceY, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);
                    
                    const pageImgData = pageCanvas.toDataURL('image/png', 0.95);
                    const pageImgHeight = (pageCanvas.height * pxToMm);
                    const pageImgWidth = (pageCanvas.width * pxToMm);
                    
                    // Scale to fit page width
                    if (pageImgWidth > pageWidth) {
                        const scale = pageWidth / pageImgWidth;
                        const scaledHeight = pageImgHeight * scale;
                        const scaledWidth = pageWidth;
                        pdf.addImage(pageImgData, 'PNG', margin, yPosition, scaledWidth, scaledHeight);
                    } else {
                        pdf.addImage(pageImgData, 'PNG', margin, yPosition, pageImgWidth, pageImgHeight);
                    }
                    
                    sourceY += pageCanvas.height;
                    
                    // Add new page if more content remains
                    if (sourceY < sourceHeight) {
                        pdf.addPage();
                        yPosition = margin;
                    }
                }
            } else {
                // Single page PDF - center the image
                const x = (pdfWidth - imgWidth) / 2;
                const y = margin;
                pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            }
            
            // Add title on first page
            pdf.setFontSize(16);
            pdf.text('Project Tree Structure', margin, margin - 5);
            
            // Save PDF
            const fileName = `${currentZipFileName || 'project'}-tree.pdf`;
            pdf.save(fileName);
            
            loading.style.display = 'none';
            
        }).catch(err => {
            loading.style.display = 'none';
            showError('Failed to export PDF: ' + err.message);
            console.error('PDF export error:', err);
        });
        
    } catch (err) {
        loading.style.display = 'none';
        showError('Failed to export PDF: ' + err.message);
        console.error('PDF export error:', err);
    }
}

// Utility functions
function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
}

function hideError() {
    error.style.display = 'none';
}


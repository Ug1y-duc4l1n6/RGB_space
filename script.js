const imageInput = document.getElementById('imageInput');
const imageCanvas = document.getElementById('imageCanvas');
const rgbCanvas = document.getElementById('rgbCanvas');
const imageCtx = imageCanvas.getContext('2d');
const rgbCtx = rgbCanvas.getContext('2d');



imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // Resize canvas to image size
            imageCanvas.width = img.width;
            imageCanvas.height = img.height;
            imageCtx.drawImage(img, 0, 0);

            // Prepare RGB 3D scatter plot canvas
            rgbCanvas.width = 300;
            rgbCanvas.height = 300;
            rgbCtx.clearRect(0, 0, 300, 300);
            rgbCtx.fillStyle = '#fff';
            rgbCtx.fillRect(0, 0, 300, 300);

            // Simple 3D projection parameters
            const centerX = 150;
            const centerY = 150;
            const scale = 1.0;
            const perspective = 0.5;
            // Rotation for isometric view
            const rotY = Math.PI / 6; // 30 deg
            const rotX = Math.PI / 6; // 30 deg

            // Project 3D RGB to 2D canvas
            function project3D(r, g, b) {
                // Center RGB at (128,128,128)
                let x = r - 128;
                let y = g - 128;
                let z = b - 128;
                // Rotate around Y axis
                let x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
                let z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
                // Rotate around X axis
                let y1 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
                let z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
                // Perspective projection
                let px = centerX + scale * x1 * (1 + perspective * z2 / 128);
                let py = centerY - scale * y1 * (1 + perspective * z2 / 128);
                return [px, py];
            }

            // Get image data
            const imgData = imageCtx.getImageData(0, 0, img.width, img.height);
            // For each pixel, plot a dot at projected (R,G,B)
            for (let i = 0; i < imgData.data.length; i += 4) {
                const r = imgData.data[i];
                const g = imgData.data[i+1];
                const b = imgData.data[i+2];
                const [px, py] = project3D(r, g, b);
                rgbCtx.fillStyle = `rgb(${r},${g},${b})`;
                rgbCtx.fillRect(px, py, 2, 2);
            }

            // Draw axis lines for reference
            function drawAxis(color, from, to) {
                rgbCtx.strokeStyle = color;
                rgbCtx.beginPath();
                rgbCtx.moveTo(...from);
                rgbCtx.lineTo(...to);
                rgbCtx.stroke();
            }
            // Red axis
            drawAxis('red', project3D(0,128,128), project3D(255,128,128));
            // Green axis
            drawAxis('green', project3D(128,0,128), project3D(128,255,128));
            // Blue axis
            drawAxis('blue', project3D(128,128,0), project3D(128,128,255));

            // Axis labels
            rgbCtx.fillStyle = 'red';
            let [rx, ry] = project3D(255,128,128);
            rgbCtx.fillText('Red', rx+5, ry);
            rgbCtx.fillStyle = 'green';
            [rx, ry] = project3D(128,255,128);
            rgbCtx.fillText('Green', rx+5, ry);
            rgbCtx.fillStyle = 'blue';
            [rx, ry] = project3D(128,128,255);
            rgbCtx.fillText('Blue', rx+5, ry);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

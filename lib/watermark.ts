/**
 * Add a watermark overlay to an image using Canvas API
 */
export async function addWatermark(imageBlob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Add semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add watermark text
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((-45 * Math.PI) / 180);
        
        const fontSize = Math.max(canvas.width, canvas.height) * 0.08;
        ctx.font = `bold ${fontSize}px 'Playfair Display', serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PREVIEW - WATERMARKED', 0, 0);
        
        // Also add smaller text below
        ctx.font = `${fontSize * 0.6}px 'Inter', sans-serif`;
        ctx.fillText('www.noblified.com', 0, fontSize * 1.2);
        
        ctx.restore();
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/png', 0.95);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(imageBlob);
  });
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert a blob to a data URL for preview
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

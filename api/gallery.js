// Serverless API untuk Wedding Gallery
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { category } = req.query;
  
  // Validasi kategori
  const allowedCategories = ['bride', 'groom', 'engagement', 'prewedding', 'moments', 'together'];
  
  if (!category || !allowedCategories.includes(category)) {
    return res.status(400).json({ 
      success: false,
      files: [], 
      error: 'Invalid category. Allowed: ' + allowedCategories.join(', ')
    });
  }
  
  try {
    // Path ke folder foto di Vercel
    const folderPath = path.join(process.cwd(), 'public', category);
    
    // Debug: Log folder path untuk troubleshooting
    console.log(`Looking for folder: ${folderPath}`);
    console.log(`Current working directory: ${process.cwd()}`);
    console.log(`Folder exists: ${fs.existsSync(folderPath)}`);
    
    // Cek folder exists
    if (!fs.existsSync(folderPath)) {
      console.log(`Folder not found: ${folderPath}`);
      return res.json({ 
        success: true,
        files: [], 
        count: 0,
        category: category,
        message: 'Category folder not found'
      });
    }
    
    // Baca semua files di folder
    const files = fs.readdirSync(folderPath)
      .filter(file => {
        // Filter hanya image files
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp', 'bmp', 'svg'].includes(ext);
      })
      .sort((a, b) => {
        // Natural sorting (1.jpg, 2.jpg, 10.jpg)
        const aNum = parseInt(a.match(/\d+/)?.[0] || '0');
        const bNum = parseInt(b.match(/\d+/)?.[0] || '0');
        
        if (aNum === bNum) {
          return a.localeCompare(b);
        }
        return aNum - bNum;
      });
    
    // Log untuk debugging
    console.log(`Found ${files.length} files in ${category}:`, files.slice(0, 5));
    
    res.json({
      success: true,
      files: files,
      count: files.length,
      category: category,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Gallery API Error:', error);
    res.status(500).json({ 
      success: false,
      files: [], 
      error: error.message 
    });
  }
}
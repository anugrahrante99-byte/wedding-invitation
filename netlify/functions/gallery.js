// Netlify Function untuk Wedding Gallery
import fs from 'fs';
import path from 'path';

export async function handler(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const { category } = event.queryStringParameters || {};
  
  // Validasi kategori
  const allowedCategories = ['bride', 'groom', 'engagement', 'prewedding', 'moments', 'together'];
  
  if (!category || !allowedCategories.includes(category)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        success: false,
        files: [], 
        error: 'Invalid category. Allowed: ' + allowedCategories.join(', ')
      })
    };
  }
  
  try {
    // Path ke folder foto di Netlify
    const folderPath = path.join(process.cwd(), category);
    
    // Debug: Log folder path untuk troubleshooting
    console.log(`Looking for folder: ${folderPath}`);
    console.log(`Current working directory: ${process.cwd()}`);
    console.log(`Folder exists: ${fs.existsSync(folderPath)}`);
    
    // Cek folder exists
    if (!fs.existsSync(folderPath)) {
      console.log(`Folder not found: ${folderPath}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          files: [], 
          count: 0,
          category: category,
          message: 'Category folder not found'
        })
      };
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
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        files: files,
        count: files.length,
        category: category,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Gallery API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        files: [], 
        error: error.message 
      })
    };
  }
}

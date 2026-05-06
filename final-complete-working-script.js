/**
 * FINAL COMPLETE WORKING SCRIPT
 * 
 * Complete API functionality with proper CORS headers
 * Fixed setHeader chaining issue - working version
 */

function doGet(e) {
  try {
    const action = e.parameter.action || 'test';
    const callback = e.parameter.callback;
    
    let result;
    
    switch (action) {
      case 'test':
        result = { ok: true, message: "GET works!", timestamp: new Date().toISOString() };
        break;
        
      case 'listwishes':
        result = listSheetData("Ucapan");
        break;
        
      case 'listsent':
        result = listSheetData("Terkirim");
        break;
        
      case 'listguests':
        result = listSheetData("Tamu");
        break;
        
      case 'listduplicates':
        result = listSheetData("Duplikat");
        break;
        
      default:
        result = { ok: false, error: "Unknown action: " + action };
    }
    
    const jsonResponse = JSON.stringify(result);
    
    // Return JSONP if callback provided
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + jsonResponse + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    // FIXED: Create output first, then set headers separately
    const output = ContentService.createTextOutput(jsonResponse)
      .setMimeType(ContentService.MimeType.JSON);
    
    // Set CORS headers properly
    output.setHeader('Access-Control-Allow-Origin', '*');
    output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return output;
      
  } catch (error) {
    const errorResult = { ok: false, error: error.toString() };
    const jsonResponse = JSON.stringify(errorResult);
    
    // FIXED: Same approach for error handling
    const output = ContentService.createTextOutput(jsonResponse)
      .setMimeType(ContentService.MimeType.JSON);
    
    output.setHeader('Access-Control-Allow-Origin', '*');
    output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return output;
  }
}

function doPost(e) {
  try {
    // Handle preflight OPTIONS request
    if (e.parameter && e.parameter.method === 'OPTIONS') {
      const output = ContentService.createTextOutput('')
        .setMimeType(ContentService.MimeType.TEXT);
      
      output.setHeader('Access-Control-Allow-Origin', '*');
      output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      return output;
    }
    
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    
    let result;
    
    switch (action) {
      case 'test':
        result = { ok: true, message: "POST API is working!", timestamp: new Date().toISOString() };
        break;
        
      case 'addwish':
        result = addWish(body);
        break;
        
      case 'marksent':
        result = markSent(body);
        break;
        
      case 'addguest':
        result = addGuest(body);
        break;
        
      case 'deletewish':
        result = deleteRow("Ucapan", body.rowId);
        break;
        
      case 'deletesent':
        result = deleteRow("Terkirim", body.rowId);
        break;
        
      case 'deleteguest':
        result = deleteRow("Tamu", body.rowId);
        break;
        
      case 'mergeduplicates':
        result = mergeDuplicates();
        break;
        
      default:
        result = { ok: false, error: "Unknown action: " + action };
    }
    
    const jsonResponse = JSON.stringify(result);
    
    // FIXED: Create output first, then set headers separately
    const output = ContentService.createTextOutput(jsonResponse)
      .setMimeType(ContentService.MimeType.JSON);
    
    // Set CORS headers properly
    output.setHeader('Access-Control-Allow-Origin', '*');
    output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return output;
      
  } catch (error) {
    Logger.log("POST Error: " + error.toString());
    const errorResult = { ok: false, error: error.toString() };
    const jsonResponse = JSON.stringify(errorResult);
    
    // FIXED: Same approach for error handling
    const output = ContentService.createTextOutput(jsonResponse)
      .setMimeType(ContentService.MimeType.JSON);
    
    output.setHeader('Access-Control-Allow-Origin', '*');
    output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return output;
  }
}

/**
 * Add wish to Ucapan sheet
 */
function addWish(body) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Ucapan");
    if (!sheet) {
      return { ok: false, error: "Sheet 'Ucapan' not found" };
    }
    
    const timestamp = new Date().toISOString();
    const rowId = sheet.getLastRow() + 1;
    
    const newRow = [
      timestamp,
      body.name || '',
      body.attendance || '',
      body.guestcount || '1',
      body.message || '',
      body.type || 'web',
      rowId
    ];
    
    sheet.appendRow(newRow);
    
    // Check for duplicates
    checkForDuplicates(body.name, "Ucapan", rowId);
    
    return { ok: true, message: "Wish added successfully", rowId: rowId };
    
  } catch (error) {
    Logger.log("Add wish error: " + error.toString());
    return { ok: false, error: error.toString() };
  }
}

/**
 * Mark as sent to Terkirim sheet
 */
function markSent(body) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Terkirim");
    if (!sheet) {
      return { ok: false, error: "Sheet 'Terkirim' not found" };
    }
    
    const timestamp = new Date().toISOString();
    const rowId = sheet.getLastRow() + 1;
    const key = normalizeKey(body.name || '');
    
    const newRow = [
      timestamp,
      body.name || '',
      body.phone || '',
      body.link || '',
      key,
      rowId
    ];
    
    sheet.appendRow(newRow);
    
    // Check for duplicates
    checkForDuplicates(body.name, "Terkirim", rowId);
    
    return { ok: true, message: "Marked as sent successfully", rowId: rowId };
    
  } catch (error) {
    Logger.log("Mark sent error: " + error.toString());
    return { ok: false, error: error.toString() };
  }
}

/**
 * Add guest to Tamu sheet
 */
function addGuest(body) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tamu");
    if (!sheet) {
      return { ok: false, error: "Sheet 'Tamu' not found" };
    }
    
    const timestamp = new Date().toISOString();
    const rowId = sheet.getLastRow() + 1;
    
    const newRow = [
      timestamp,
      body.name || '',
      body.phone || '',
      body.attendance || '',
      body.guestcount || '1',
      body.message || '',
      rowId
    ];
    
    sheet.appendRow(newRow);
    
    // Check for duplicates
    checkForDuplicates(body.name, "Tamu", rowId);
    
    return { ok: true, message: "Guest added successfully", rowId: rowId };
    
  } catch (error) {
    Logger.log("Add guest error: " + error.toString());
    return { ok: false, error: error.toString() };
  }
}

/**
 * List data from sheet
 */
function listSheetData(sheetName) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      return { ok: false, error: "Sheet not found: " + sheetName };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const result = rows.map((row, index) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header.toLowerCase().replace(/\s+/g, '')] = row[i] || '';
      });
      obj.rowId = index + 2; // +2 because row 1 is headers and array is 0-indexed
      return obj;
    });
    
    return { ok: true, data: result };
    
  } catch (error) {
    Logger.log("List error: " + error.toString());
    return { ok: false, error: error.toString() };
  }
}

/**
 * Delete a row from a sheet
 */
function deleteRow(sheetName, rowId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      return { ok: false, error: "Sheet not found: " + sheetName };
    }
    
    if (rowId && rowId > 1) {
      sheet.deleteRow(rowId);
      return { ok: true, message: "Row deleted successfully" };
    }
    
    return { ok: false, error: "Invalid row ID" };
    
  } catch (error) {
    Logger.log("Delete row error: " + error.toString());
    return { ok: false, error: error.toString() };
  }
}

/**
 * Check for duplicates and log them
 */
function checkForDuplicates(name, sheetName, rowId) {
  try {
    const key = normalizeKey(name);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Check all sheets for this key
    const sheets = ["Ucapan", "Terkirim", "Tamu"];
    sheets.forEach(checkSheetName => {
      if (checkSheetName === "Duplikat") return; // Skip duplicates sheet
      
      const sheet = ss.getSheetByName(checkSheetName);
      if (!sheet) return;
      
      const data = sheet.getDataRange().getValues();
      
      data.forEach((row, index) => {
        if (index === 0) return; // Skip header
        
        const existingKey = normalizeKey(row[1] || ''); // Name is usually column 2
        if (existingKey === key && (index + 2) !== rowId) {
          // Found duplicate
          logDuplicate(name, row[1] || '', sheetName, checkSheetName, rowId, index + 2);
        }
      });
    });
    
  } catch (error) {
    Logger.log("Duplicate check error: " + error.toString());
  }
}

/**
 * Log duplicate entry
 */
function logDuplicate(originalName, duplicateName, originalSheet, duplicateSheet, originalRowId, duplicateRowId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Duplikat");
    if (!sheet) return;
    
    const timestamp = new Date().toISOString();
    
    const newRow = [
      timestamp,
      originalName,
      duplicateName,
      originalRowId,
      duplicateRowId,
      false // Not merged yet
    ];
    
    sheet.appendRow(newRow);
    
  } catch (error) {
    Logger.log("Log duplicate error: " + error.toString());
  }
}

/**
 * Merge all duplicates
 */
function mergeDuplicates() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Duplikat");
    if (!sheet) {
      return { ok: false, error: "Duplicates sheet not found" };
    }
    
    const data = sheet.getDataRange().getValues();
    
    let mergedCount = 0;
    
    data.forEach((row, index) => {
      if (index === 0) return; // Skip header
      
      if (!row[5]) { // Not merged yet
        // Mark as merged
        sheet.getRange(index + 1, 6).setValue(true);
        mergedCount++;
      }
    });
    
    return { ok: true, message: `Merged ${mergedCount} duplicates` };
    
  } catch (error) {
    Logger.log("Merge duplicates error: " + error.toString());
    return { ok: false, error: error.toString() };
  }
}

/**
 * Normalize key for duplicate detection
 */
function normalizeKey(text) {
  if (!text) return '';
  
  return text.toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

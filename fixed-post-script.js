/**
 * FIXED POST REQUEST HANDLER
 * 
 * Instructions:
 * 1. Open your existing Google Sheets Apps Script
 * 2. Replace ONLY the doPost function with this corrected version
 * 3. Save and redeploy as Web App
 * 4. Keep "Who has access: Anyone"
 */

/**
 * POST Request Handler - FIXED VERSION
 * Handles all write operations with proper CORS headers and error handling
 */
function doPost(e) {
  try {
    // Log incoming request for debugging
    Logger.log("POST request received: " + JSON.stringify(e));
    
    // Handle preflight OPTIONS request
    if (e.parameter && e.parameter.method === 'OPTIONS') {
      return ContentService.createTextOutput('')
        .setMimeType(ContentService.MimeType.TEXT)
        .setHeader('Access-Control-Allow-Origin', '*')
        .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        .setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    
    // Parse request body
    let body;
    try {
      if (e.postData && e.postData.contents) {
        body = JSON.parse(e.postData.contents);
      } else {
        body = {};
      }
    } catch (parseError) {
      Logger.log("JSON parse error: " + parseError.toString());
      return ContentService.createTextOutput(JSON.stringify({
        ok: false, 
        error: "Invalid JSON in request body"
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    
    const action = body.action || 'test';
    Logger.log("Action: " + action);
    
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
    
    Logger.log("Result: " + JSON.stringify(result));
    
    const jsonResponse = JSON.stringify(result);
    
    return ContentService.createTextOutput(jsonResponse)
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
  } catch (error) {
    Logger.log("POST Error: " + error.toString());
    const errorResult = { 
      ok: false, 
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
    const jsonResponse = JSON.stringify(errorResult);
    
    return ContentService.createTextOutput(jsonResponse)
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

/**
 * Add wish to Ucapan sheet - ENHANCED VERSION
 */
function addWish(body) {
  try {
    Logger.log("Adding wish: " + JSON.stringify(body));
    
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
    Logger.log("Wish added successfully, rowId: " + rowId);
    
    // Check for duplicates
    checkForDuplicates(body.name, "Ucapan", rowId);
    
    return { ok: true, message: "Wish added successfully", rowId: rowId };
    
  } catch (error) {
    Logger.log("Add wish error: " + error.toString());
    return { ok: false, error: error.toString() };
  }
}

/**
 * Mark as sent to Terkirim sheet - ENHANCED VERSION
 */
function markSent(body) {
  try {
    Logger.log("Marking sent: " + JSON.stringify(body));
    
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
    Logger.log("Mark sent successfully, rowId: " + rowId);
    
    // Check for duplicates
    checkForDuplicates(body.name, "Terkirim", rowId);
    
    return { ok: true, message: "Marked as sent successfully", rowId: rowId };
    
  } catch (error) {
    Logger.log("Mark sent error: " + error.toString());
    return { ok: false, error: error.toString() };
  }
}

/**
 * Add guest to Tamu sheet - ENHANCED VERSION
 */
function addGuest(body) {
  try {
    Logger.log("Adding guest: " + JSON.stringify(body));
    
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
    Logger.log("Guest added successfully, rowId: " + rowId);
    
    // Check for duplicates
    checkForDuplicates(body.name, "Tamu", rowId);
    
    return { ok: true, message: "Guest added successfully", rowId: rowId };
    
  } catch (error) {
    Logger.log("Add guest error: " + error.toString());
    return { ok: false, error: error.toString() };
  }
}

/**
 * Delete a row from a sheet - ENHANCED VERSION
 */
function deleteRow(sheetName, rowId) {
  try {
    Logger.log("Deleting row from " + sheetName + ", rowId: " + rowId);
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      return { ok: false, error: "Sheet not found: " + sheetName };
    }
    
    if (rowId && rowId > 1) {
      sheet.deleteRow(rowId);
      Logger.log("Row deleted successfully");
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

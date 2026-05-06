/**
 * AUTOMATED GOOGLE SHEETS SETUP SCRIPT
 * 
 * Instructions:
 * 1. Create new Google Sheet at https://sheets.google.com
 * 2. Go to Extensions > Apps Script
 * 3. Copy and paste this entire code
 * 4. Run the function "setupWeddingSheets()"
 * 5. Deploy as Web App when prompted
 * 
 * This script will automatically:
 * - Create all required sheets with proper headers
 * - Setup the complete Apps Script API
 * - Provide the Web App URL for frontend integration
 */

// SPREADSHEET CONFIGURATION
const SPREADSHEET_NAME = "Wedding Invitation Management";
const SHEETS = {
  wishes: "Ucapan",
  sent: "Terkirim", 
  guests: "Tamu",
  duplicates: "Duplikat"
};

// HEADERS CONFIGURATION
const HEADERS = {
  [SHEETS.wishes]: ["Timestamp", "Name", "Attendance", "Guest Count", "Message", "Type", "rowId"],
  [SHEETS.sent]: ["Timestamp", "Name", "Phone", "Link", "Key", "rowId"],
  [SHEETS.guests]: ["Timestamp", "Name", "Phone", "Attendance", "Guest Count", "Message", "rowId"],
  [SHEETS.duplicates]: ["Timestamp", "Original Name", "Duplicate Name", "Original rowId", "Duplicate rowId", "Merged"]
};

/**
 * MAIN SETUP FUNCTION
 * Run this function to setup the complete wedding management system
 */
function setupWeddingSheets() {
  try {
    Logger.log("🚀 Starting Wedding Sheets Setup...");
    
    // Step 1: Create all sheets with headers
    setupAllSheets();
    
    // Step 2: Test the API
    testAPI();
    
    // Step 3: Get deployment info
    const deploymentInfo = getDeploymentInfo();
    
    Logger.log("✅ Setup completed successfully!");
    Logger.log("📋 Next steps:");
    Logger.log("1. Deploy as Web App: Extensions > Apps Script > Deploy > New Deployment");
    Logger.log("2. Set 'Execute as: Me' and 'Who has access: Anyone'");
    Logger.log("3. Copy the Web App URL and update your frontend files");
    Logger.log("🔗 Web App URL will be: " + deploymentInfo.webAppUrl);
    
    SpreadsheetApp.getUi().alert(
      "✅ Wedding Sheets Setup Complete!\n\n" +
      "Next steps:\n" +
      "1. Deploy as Web App\n" +
      "2. Copy Web App URL\n" +
      "3. Update frontend files\n\n" +
      "Check logs for detailed instructions."
    );
    
  } catch (error) {
    Logger.log("❌ Setup failed: " + error.toString());
    SpreadsheetApp.getUi().alert("Setup failed: " + error.toString());
  }
}

/**
 * Create all required sheets with proper headers
 */
function setupAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Set spreadsheet name
  ss.rename(SPREADSHEET_NAME);
  
  // Create each sheet with headers
  Object.keys(SHEETS).forEach(sheetKey => {
    const sheetName = SHEETS[sheetKey];
    createSheetWithHeaders(ss, sheetName, HEADERS[sheetName]);
  });
  
  Logger.log("📊 All sheets created with headers");
}

/**
 * Create a single sheet with headers
 */
function createSheetWithHeaders(ss, sheetName, headers) {
  let sheet;
  
  // Check if sheet exists
  try {
    sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      // Clear existing sheet
      sheet.clear();
      Logger.log("📝 Cleared existing sheet: " + sheetName);
    }
  } catch (e) {
    // Sheet doesn't exist, create new one
  }
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    Logger.log("📝 Created new sheet: " + sheetName);
  }
  
  // Set headers
  sheet.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight("bold")
    .setBackground("#4285F4")
    .setFontColor("white");
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
  
  // Freeze header row
  sheet.setFrozenRows(1);
}

/**
 * Test the API functionality
 */
function testAPI() {
  Logger.log("🧪 Testing API functionality...");
  
  // Test GET endpoint
  const testGet = doGet({ action: "test" });
  Logger.log("✅ GET test: " + JSON.stringify(testGet));
  
  // Test POST endpoint
  const testPost = doPost({
    parameter: JSON.stringify({ action: "test" })
  });
  Logger.log("✅ POST test: " + JSON.stringify(testPost));
}

/**
 * Get deployment information
 */
function getDeploymentInfo() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const spreadsheetId = ss.getId();
  
  return {
    spreadsheetId: spreadsheetId,
    spreadsheetName: SPREADSHEET_NAME,
    webAppUrl: "https://script.google.com/macros/s/" + ScriptApp.getScriptId() + "/exec",
    sheets: Object.values(SHEETS)
  };
}

/**
 * =======================================================
 * MAIN API HANDLERS
 * =======================================================
 */

/**
 * GET Request Handler
 * Handles all read operations
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'test';
    const callback = e.parameter.callback;
    
    let result;
    
    switch (action) {
      case 'test':
        result = { ok: true, message: "Wedding API is working!", timestamp: new Date().toISOString() };
        break;
        
      case 'listwishes':
        result = listSheetData(SHEETS.wishes);
        break;
        
      case 'listsent':
        result = listSheetData(SHEETS.sent);
        break;
        
      case 'listguests':
        result = listSheetData(SHEETS.guests);
        break;
        
      case 'listduplicates':
        result = listSheetData(SHEETS.duplicates);
        break;
        
      default:
        result = { ok: false, error: "Unknown action: " + action };
    }
    
    // Return JSONP if callback provided
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log("GET Error: " + error.toString());
    const errorResult = { ok: false, error: error.toString() };
    return ContentService.createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * POST Request Handler
 * Handles all write operations
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    
    let result;
    
    switch (action) {
      case 'test':
        result = { ok: true, message: "POST API is working!" };
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
        result = deleteRow(SHEETS.wishes, body.rowId);
        break;
        
      case 'deletesent':
        result = deleteRow(SHEETS.sent, body.rowId);
        break;
        
      case 'deleteguest':
        result = deleteRow(SHEETS.guests, body.rowId);
        break;
        
      case 'mergeduplicates':
        result = mergeDuplicates();
        break;
        
      default:
        result = { ok: false, error: "Unknown action: " + action };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log("POST Error: " + error.toString());
    const errorResult = { ok: false, error: error.toString() };
    return ContentService.createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * =======================================================
 * SHEET OPERATIONS
 * =======================================================
 */

/**
 * List all data from a sheet
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
 * Add wish to Ucapan sheet
 */
function addWish(body) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.wishes);
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
    checkForDuplicates(body.name, SHEETS.wishes, rowId);
    
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
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.sent);
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
    checkForDuplicates(body.name, SHEETS.sent, rowId);
    
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
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.guests);
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
    checkForDuplicates(body.name, SHEETS.guests, rowId);
    
    return { ok: true, message: "Guest added successfully", rowId: rowId };
    
  } catch (error) {
    Logger.log("Add guest error: " + error.toString());
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
    Object.values(SHEETS).forEach(checkSheetName => {
      if (checkSheetName === SHEETS.duplicates) return; // Skip duplicates sheet
      
      const sheet = ss.getSheetByName(checkSheetName);
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
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.duplicates);
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
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.duplicates);
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

/**
 * =======================================================
 * UTILITY FUNCTIONS
 * =======================================================
 */

/**
 * Get spreadsheet info
 */
function getSpreadsheetInfo() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    id: ss.getId(),
    name: ss.getName(),
    url: ss.getUrl(),
    sheets: ss.getSheets().map(sheet => ({
      name: sheet.getName(),
      rows: sheet.getLastRow(),
      columns: sheet.getLastColumn()
    }))
  };
}

/**
 * Custom menu for easy access
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Wedding Management')
    .addItem('Setup Wedding Sheets', 'setupWeddingSheets')
    .addItem('Test API', 'testAPI')
    .addItem('Get Info', 'getSpreadsheetInfo')
    .addSeparator()
    .addItem('View Logs', 'viewLogs')
    .addToUi();
}

/**
 * View execution logs
 */
function viewLogs() {
  const logs = Logger.getLog();
  if (logs) {
    SpreadsheetApp.getUi().alert("Recent Logs:\n\n" + logs);
  } else {
    SpreadsheetApp.getUi().alert("No logs available. Run some functions first.");
  }
}

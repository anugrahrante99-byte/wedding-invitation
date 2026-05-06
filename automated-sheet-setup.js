/**
 * AUTOMATED GOOGLE SHEETS SETUP
 * 
 * Creates all required sheets with proper headers
 * Run this once to setup the complete wedding system
 */

function setupWeddingSheets() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // List of sheets to create with their headers
    const sheetsToCreate = [
      {
        name: "Ucapan",
        headers: ["Timestamp", "Name", "Attendance", "GuestCount", "Message", "Type", "RowId"]
      },
      {
        name: "Terkirim", 
        headers: ["Timestamp", "Name", "Phone", "Link", "Key", "RowId"]
      },
      {
        name: "Tamu",
        headers: ["Timestamp", "Name", "Phone", "Attendance", "GuestCount", "Message", "RowId"]
      },
      {
        name: "Duplikat",
        headers: ["Timestamp", "OriginalName", "DuplicateName", "OriginalRowId", "DuplicateRowId", "Merged"]
      }
    ];
    
    let results = [];
    
    // Create each sheet
    sheetsToCreate.forEach(sheetInfo => {
      try {
        // Check if sheet already exists
        let sheet = spreadsheet.getSheetByName(sheetInfo.name);
        
        if (!sheet) {
          // Create new sheet
          sheet = spreadsheet.insertSheet(sheetInfo.name);
          results.push(`✅ Created sheet: ${sheetInfo.name}`);
        } else {
          // Clear existing sheet
          sheet.clear();
          results.push(`🔄 Cleared existing sheet: ${sheetInfo.name}`);
        }
        
        // Add headers
        sheet.getRange(1, 1, 1, sheetInfo.headers.length).setValues([sheetInfo.headers]);
        
        // Format headers (bold, background color)
        const headerRange = sheet.getRange(1, 1, 1, sheetInfo.headers.length);
        headerRange.setFontWeight("bold");
        headerRange.setBackground("#4285F4");
        headerRange.setFontColor("white");
        
        // Auto-resize columns
        sheet.autoResizeColumns(1, sheetInfo.headers.length);
        
        results.push(`✅ Setup completed for: ${sheetInfo.name}`);
        
      } catch (error) {
        results.push(`❌ Error setting up ${sheetInfo.name}: ${error.toString()}`);
      }
    });
    
    // Set the first sheet as active
    const firstSheet = spreadsheet.getSheetByName("Ucapan");
    if (firstSheet) {
      spreadsheet.setActiveSheet(firstSheet);
    }
    
    return {
      success: true,
      message: "Sheet setup completed successfully!",
      details: results
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
      message: "Failed to setup sheets"
    };
  }
}

/**
 * Test function to verify sheet setup
 */
function testSheetSetup() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheetNames = ["Ucapan", "Terkirim", "Tamu", "Duplikat"];
    let results = [];
    
    sheetNames.forEach(sheetName => {
      const sheet = spreadsheet.getSheetByName(sheetName);
      if (sheet) {
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const hasData = sheet.getLastRow() > 1;
        results.push({
          sheet: sheetName,
          exists: true,
          headers: headers,
          hasData: hasData,
          rowCount: sheet.getLastRow()
        });
      } else {
        results.push({
          sheet: sheetName,
          exists: false
        });
      }
    });
    
    return {
      success: true,
      sheets: results
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Add sample data for testing
 */
function addSampleData() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const timestamp = new Date().toISOString();
    
    // Sample wish data
    const ucapanSheet = spreadsheet.getSheetByName("Ucapan");
    if (ucapanSheet && ucapanSheet.getLastRow() === 1) {
      const sampleWishes = [
        [timestamp, "John Doe", "Hadir", "2", "Congratulations on your wedding!", "web", 1],
        [timestamp, "Jane Smith", "Hadir", "1", "Wishing you a lifetime of happiness!", "web", 2],
        [timestamp, "Bob Johnson", "Tidak Hadir", "1", "Sorry I can't make it, but best wishes!", "web", 3]
      ];
      ucapanSheet.getRange(2, 1, sampleWishes.length, sampleWishes[0].length).setValues(sampleWishes);
    }
    
    // Sample guest data
    const tamuSheet = spreadsheet.getSheetByName("Tamu");
    if (tamuSheet && tamuSheet.getLastRow() === 1) {
      const sampleGuests = [
        [timestamp, "John Doe", "+628123456789", "Hadir", "2", "Looking forward to the celebration!", 1],
        [timestamp, "Jane Smith", "+628987654321", "Hadir", "1", "Can't wait to celebrate with you!", 2]
      ];
      tamuSheet.getRange(2, 1, sampleGuests.length, sampleGuests[0].length).setValues(sampleGuests);
    }
    
    // Sample sent data
    const terkirimSheet = spreadsheet.getSheetByName("Terkirim");
    if (terkirimSheet && terkirimSheet.getLastRow() === 1) {
      const sampleSent = [
        [timestamp, "John Doe", "+628123456789", "https://wa.me/628123456789", "johndoe", 1],
        [timestamp, "Jane Smith", "+628987654321", "https://wa.me/628987654321", "janesmith", 2]
      ];
      terkirimSheet.getRange(2, 1, sampleSent.length, sampleSent[0].length).setValues(sampleSent);
    }
    
    return {
      success: true,
      message: "Sample data added successfully!"
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Complete setup function - runs everything
 */
function completeSetup() {
  try {
    // Setup sheets
    const setupResult = setupWeddingSheets();
    if (!setupResult.success) {
      return setupResult;
    }
    
    // Add sample data
    const sampleResult = addSampleData();
    if (!sampleResult.success) {
      return sampleResult;
    }
    
    // Test setup
    const testResult = testSheetSetup();
    
    return {
      success: true,
      message: "Complete wedding system setup finished!",
      setup: setupResult,
      sampleData: sampleResult,
      verification: testResult
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
      message: "Complete setup failed"
    };
  }
}

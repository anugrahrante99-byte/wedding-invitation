const SPREADSHEET_ID = '1gvHiIkStxwhnhLZhK7se-TfQucecSy-9ClZe_gKv8A8';

const SHEETS = {
  wishes: 'Ucapan',
  sent: 'Terkirim',
  guests: 'Tamu', // New sheet for WhatsApp guest data
  duplicates: 'Duplikat' // New sheet for tracking duplicates
};

function doGet(e) {
  let action = e.parameter.action || '';
  action = action.toLowerCase();
  
  Logger.log('Action received: ' + action);
  
  let payload;
  if (action === 'listwishes') {
    payload = { ok: true, data: readRows_(SHEETS.wishes) };
  } else if (action === 'listsent') {
    payload = { ok: true, data: readRows_(SHEETS.sent) };
  } else if (action === 'listguests') {
    payload = { ok: true, data: readRows_(SHEETS.guests) };
  } else if (action === 'listduplicates') {
    payload = { ok: true, data: readRows_(SHEETS.duplicates) };
  } else if (action === 'test') {
    payload = { ok: true, message: 'Enhanced API is working!' };
  } else {
    payload = { ok: true, message: 'Unknown action: ' + action };
  }

  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const body = JSON.parse((e.postData && e.postData.contents) || '{}');
  const action = (body.action || '').toLowerCase();

  if (action === 'addwish') {
    ensureSheet_(SHEETS.wishes, ['timestamp', 'name', 'attendance', 'guestCount', 'message', 'type']);
    appendObject_(SHEETS.wishes, {
      timestamp: body.timestamp || new Date().toISOString(),
      name: body.name || '',
      attendance: body.attendance || '',
      guestCount: body.guestCount || '',
      message: body.message || '',
      type: body.type || 'combined'
    });
    return json_({ ok: true });
  }

  if (action === 'addguest') {
    ensureSheet_(SHEETS.guests, ['timestamp', 'name', 'phone', 'address', 'attendance', 'guestCount', 'notes', 'duplicateOf']);
    
    // Check for duplicates
    const normalizedName = normalizeName_(body.name || '');
    const existingGuests = readRows_(SHEETS.guests);
    const duplicate = existingGuests.find(guest => normalizeName_(guest.name) === normalizedName);
    
    if (duplicate) {
      // Log duplicate
      ensureSheet_(SHEETS.duplicates, ['timestamp', 'originalName', 'duplicateName', 'action']);
      appendObject_(SHEETS.duplicates, {
        timestamp: new Date().toISOString(),
        originalName: duplicate.name,
        duplicateName: body.name || '',
        action: 'duplicate_detected'
      });
      
      return json_({ 
        ok: true, 
        duplicate: true, 
        originalId: duplicate.rowId || duplicate.timestamp,
        message: 'Duplicate guest detected'
      });
    }
    
    appendObject_(SHEETS.guests, {
      timestamp: body.timestamp || new Date().toISOString(),
      name: body.name || '',
      phone: body.phone || '',
      address: body.address || '',
      attendance: body.attendance || '',
      guestCount: body.guestCount || '',
      notes: body.notes || '',
      duplicateOf: ''
    });
    return json_({ ok: true, duplicate: false });
  }

  if (action === 'marksent') {
    ensureSheet_(SHEETS.sent, ['timestamp', 'name', 'phone', 'link', 'key']);
    const key = normalizeKey_(body.name || '');
    const existing = readRows_(SHEETS.sent).some(row => row.key === key);
    if (!existing) {
      appendObject_(SHEETS.sent, {
        timestamp: body.timestamp || new Date().toISOString(),
        name: body.name || '',
        phone: body.phone || '',
        link: body.link || '',
        key
      });
    }
    return json_({ ok: true, duplicate: existing });
  }

  // New management functions
  if (action === 'deletewish') {
    const rowId = body.rowId;
    if (rowId) {
      deleteRow_(SHEETS.wishes, rowId);
      return json_({ ok: true, message: 'Wish deleted successfully' });
    }
    return json_({ ok: false, error: 'Row ID required' });
  }

  if (action === 'editwish') {
    const rowId = body.rowId;
    const updatedData = body.data;
    if (rowId && updatedData) {
      updateRow_(SHEETS.wishes, rowId, updatedData);
      return json_({ ok: true, message: 'Wish updated successfully' });
    }
    return json_({ ok: false, error: 'Row ID and data required' });
  }

  if (action === 'deleteguest') {
    const rowId = body.rowId;
    if (rowId) {
      deleteRow_(SHEETS.guests, rowId);
      return json_({ ok: true, message: 'Guest deleted successfully' });
    }
    return json_({ ok: false, error: 'Row ID required' });
  }

  if (action === 'editguest') {
    const rowId = body.rowId;
    const updatedData = body.data;
    if (rowId && updatedData) {
      updateRow_(SHEETS.guests, rowId, updatedData);
      return json_({ ok: true, message: 'Guest updated successfully' });
    }
    return json_({ ok: false, error: 'Row ID and data required' });
  }

  if (action === 'mergeduplicates') {
    const duplicates = readRows_(SHEETS.duplicates);
    let mergedCount = 0;
    
    duplicates.forEach(duplicate => {
      if (duplicate.action === 'duplicate_detected' && !duplicate.merged) {
        // Find original and duplicate guests
        const guests = readRows_(SHEETS.guests);
        const original = guests.find(g => normalizeName_(g.name) === normalizeName_(duplicate.originalName));
        const duplicateGuest = guests.find(g => normalizeName_(g.name) === normalizeName_(duplicate.duplicateName));
        
        if (original && duplicateGuest) {
          // Merge data: keep original, update with duplicate's additional info
          const mergedData = {
            ...original,
            phone: original.phone || duplicateGuest.phone,
            address: original.address || duplicateGuest.address,
            attendance: original.attendance || duplicateGuest.attendance,
            guestCount: original.guestCount || duplicateGuest.guestCount,
            notes: (original.notes || '') + (duplicateGuest.notes ? ' | ' + duplicateGuest.notes : '')
          };
          
          updateRow_(SHEETS.guests, original.rowId || original.timestamp, mergedData);
          deleteRow_(SHEETS.guests, duplicateGuest.rowId || duplicateGuest.timestamp);
          
          // Mark as merged
          updateRow_(SHEETS.duplicates, duplicate.rowId || duplicate.timestamp, { merged: true, mergedAt: new Date().toISOString() });
          mergedCount++;
        }
      }
    });
    
    return json_({ ok: true, message: `Merged ${mergedCount} duplicate guests` });
  }

  return json_({ ok: false, error: 'Unknown action: ' + action });
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function ensureSheet_(name, headers) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    return sheet;
  }

  const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const missing = headers.filter(header => !currentHeaders.includes(header));
  if (missing.length) {
    sheet.getRange(1, currentHeaders.length + 1, 1, missing.length).setValues([missing]);
  }
  return sheet;
}

function appendObject_(sheetName, object) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(header => object[header] || '');
  
  // Add row ID for tracking
  object.rowId = new Date().getTime().toString();
  row.push(object.rowId);
  
  sheet.appendRow(row);
}

function readRows_(sheetName) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  return values
    .filter(row => row.some(Boolean))
    .map((row, index) => {
      const item = {};
      headers.forEach((header, headerIndex) => {
        item[header] = row[headerIndex];
      });
      item.rowIndex = index + 2; // +2 because of header row and 0-based index
      return item;
    });
}

function deleteRow_(sheetName, rowId) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  
  // Find row by rowId
  const rowIndex = data.findIndex((row, index) => {
    const rowIdColumn = row[row.length - 1]; // Assuming rowId is last column
    return rowIdColumn === rowId;
  });
  
  if (rowIndex !== -1) {
    sheet.deleteRow(rowIndex + 1); // +1 because sheet rows are 1-based
  }
}

function updateRow_(sheetName, rowId, updatedData) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find row by rowId
  const rowIndex = data.findIndex((row, index) => {
    const rowIdColumn = row[row.length - 1]; // Assuming rowId is last column
    return rowIdColumn === rowId;
  });
  
  if (rowIndex !== -1) {
    headers.forEach((header, headerIndex) => {
      if (updatedData.hasOwnProperty(header)) {
        sheet.getRange(rowIndex + 1, headerIndex + 1).setValue(updatedData[header]);
      }
    });
  }
}

function normalizeName_(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/gi, '') // Remove special characters
    .trim();
}

function normalizeKey_(value) {
  return String(value).trim().replace(/\s+/g, ' ').toLowerCase();
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

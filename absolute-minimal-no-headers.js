/**
 * ABSOLUTE MINIMAL SCRIPT - NO HEADERS AT ALL
 * Just to test if deployment works
 */

function doGet(e) {
  try {
    const action = e.parameter.action || 'test';
    
    let result;
    
    switch (action) {
      case 'test':
        result = { ok: true, message: "GET works!", timestamp: new Date().toISOString() };
        break;
        
      default:
        result = { ok: false, error: "Unknown action: " + action };
    }
    
    const jsonResponse = JSON.stringify(result);
    
    // NO HEADERS - JUST BASIC RESPONSE
    return ContentService.createTextOutput(jsonResponse)
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    const errorResult = { ok: false, error: error.toString() };
    const jsonResponse = JSON.stringify(errorResult);
    
    return ContentService.createTextOutput(jsonResponse)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    
    let result;
    
    switch (action) {
      case 'test':
        result = { ok: true, message: "POST API is working!", timestamp: new Date().toISOString() };
        break;
        
      default:
        result = { ok: false, error: "Unknown action: " + action };
    }
    
    const jsonResponse = JSON.stringify(result);
    
    // NO HEADERS - JUST BASIC RESPONSE
    return ContentService.createTextOutput(jsonResponse)
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    const errorResult = { ok: false, error: error.toString() };
    const jsonResponse = JSON.stringify(errorResult);
    
    return ContentService.createTextOutput(jsonResponse)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

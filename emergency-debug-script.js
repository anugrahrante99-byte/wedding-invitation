/**
 * EMERGENCY DEBUG SCRIPT - MINIMAL VERSION
 * 
 * This is the simplest possible version to identify the exact issue
 */

function doGet(e) {
  try {
    Logger.log("DOE: " + JSON.stringify(e));
    
    const result = {
      ok: true,
      message: "GET works!",
      timestamp: new Date().toISOString(),
      params: e.parameter
    };
    
    const jsonResponse = JSON.stringify(result);
    
    // Try the simplest response first
    return ContentService.createTextOutput(jsonResponse)
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log("DOE Error: " + error.toString());
    
    const errorResult = { 
      ok: false, 
      error: error.toString(),
      stack: error.stack
    };
    
    const jsonResponse = JSON.stringify(errorResult);
    
    return ContentService.createTextOutput(jsonResponse)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    Logger.log("DOPE: " + JSON.stringify(e));
    
    // Check if postData exists
    if (!e.postData) {
      return ContentService.createTextOutput(JSON.stringify({
        ok: false,
        error: "No postData found"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    Logger.log("PostData: " + e.postData.contents);
    
    // Try to parse
    let body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return ContentService.createTextOutput(JSON.stringify({
        ok: false,
        error: "JSON parse error: " + parseError.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = body.action || 'test';
    
    let result;
    switch (action) {
      case 'test':
        result = {
          ok: true,
          message: "POST test works!",
          timestamp: new Date().toISOString(),
          receivedBody: body
        };
        break;
        
      case 'addwish':
        result = {
          ok: true,
          message: "Add wish test works!",
          timestamp: new Date().toISOString(),
          receivedBody: body
        };
        break;
        
      case 'marksent':
        result = {
          ok: true,
          message: "Mark sent test works!",
          timestamp: new Date().toISOString(),
          receivedBody: body
        };
        break;
        
      default:
        result = {
          ok: false,
          error: "Unknown action: " + action,
          timestamp: new Date().toISOString()
        };
    }
    
    const jsonResponse = JSON.stringify(result);
    
    return ContentService.createTextOutput(jsonResponse)
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log("DOPE Error: " + error.toString());
    Logger.log("Stack: " + error.stack);
    
    const errorResult = { 
      ok: false, 
      error: error.toString(),
      stack: error.stack
    };
    
    const jsonResponse = JSON.stringify(errorResult);
    
    return ContentService.createTextOutput(jsonResponse)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

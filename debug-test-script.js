/**
 * DEBUG TEST SCRIPT - FOR TROUBLESHOOTING ONLY
 * 
 * Replace your entire Apps Script with this minimal debug version
 * to identify the exact issue
 */

function doGet(e) {
  try {
    Logger.log("GET request received: " + JSON.stringify(e));
    
    const result = {
      ok: true,
      message: "GET works!",
      timestamp: new Date().toISOString(),
      params: e.parameter
    };
    
    const jsonResponse = JSON.stringify(result);
    
    const output = ContentService.createTextOutput(jsonResponse)
      .setMimeType(ContentService.MimeType.JSON);
    
    output.setHeader('Access-Control-Allow-Origin', '*');
    output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return output;
    
  } catch (error) {
    Logger.log("GET Error: " + error.toString());
    
    const errorResult = {
      ok: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
    
    const jsonResponse = JSON.stringify(errorResult);
    
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
    Logger.log("=== POST DEBUG START ===");
    Logger.log("POST request received: " + JSON.stringify(e));
    
    // Check if postData exists
    if (!e.postData) {
      Logger.log("ERROR: No postData found");
      return createErrorResponse("No postData found");
    }
    
    Logger.log("postData contents: " + e.postData.contents);
    
    // Try to parse JSON
    let body;
    try {
      body = JSON.parse(e.postData.contents);
      Logger.log("Parsed body: " + JSON.stringify(body));
    } catch (parseError) {
      Logger.log("JSON parse error: " + parseError.toString());
      return createErrorResponse("JSON parse error: " + parseError.toString());
    }
    
    const action = body.action || 'test';
    Logger.log("Action: " + action);
    
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
    
    Logger.log("Result: " + JSON.stringify(result));
    Logger.log("=== POST DEBUG END ===");
    
    return createSuccessResponse(result);
    
  } catch (error) {
    Logger.log("POST Error: " + error.toString());
    Logger.log("Error stack: " + error.stack);
    return createErrorResponse(error.toString());
  }
}

function createSuccessResponse(data) {
  const jsonResponse = JSON.stringify(data);
  
  const output = ContentService.createTextOutput(jsonResponse)
    .setMimeType(ContentService.MimeType.JSON);
  
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  return output;
}

function createErrorResponse(error) {
  const errorResult = {
    ok: false,
    error: error,
    timestamp: new Date().toISOString()
  };
  
  const jsonResponse = JSON.stringify(errorResult);
  
  const output = ContentService.createTextOutput(jsonResponse)
    .setMimeType(ContentService.MimeType.JSON);
  
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  return output;
}

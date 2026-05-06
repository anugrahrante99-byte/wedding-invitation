/**
 * MINIMAL TEST SCRIPT - FOR DEBUGGING ONLY
 * 
 * Replace your entire Apps Script with this minimal version
 * to test if basic POST requests work
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    ok: true, 
    message: "GET works!",
    timestamp: new Date().toISOString()
  }))
  .setMimeType(ContentService.MimeType.JSON)
  .setHeader('Access-Control-Allow-Origin', '*')
  .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function doPost(e) {
  try {
    Logger.log("POST received: " + JSON.stringify(e));
    
    // Simple test response
    const result = {
      ok: true,
      message: "POST works!",
      timestamp: new Date().toISOString(),
      received: e.postData ? e.postData.contents : "No data"
    };
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
  } catch (error) {
    Logger.log("POST Error: " + error.toString());
    
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

/**
 * FUNDAMENTAL DEBUG SCRIPT - ABSOLUTE MINIMAL
 * 
 * This is the simplest possible script to test if Apps Script works at all
 */

function doGet(e) {
  try {
    // Most basic response possible
    return ContentService.createTextOutput("GET WORKS");
  } catch (error) {
    return ContentService.createTextOutput("GET ERROR: " + error.toString());
  }
}

function doPost(e) {
  try {
    // Most basic response possible
    return ContentService.createTextOutput("POST WORKS");
  } catch (error) {
    return ContentService.createTextOutput("POST ERROR: " + error.toString());
  }
}

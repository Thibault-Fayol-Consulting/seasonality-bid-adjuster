/**
 * seasonality-bid-adjuster - Script Google Ads for SMBs
 * Author: Thibault Fayol
 */
var CONFIG = { TEST_MODE: true, EVENT_START: "2026-11-20", BOOST: 1.5 };
function main(){
  var now = new Date().toISOString();
  if(now > CONFIG.EVENT_START){
    Logger.log("Event started! Applying boost of " + CONFIG.BOOST);
  }
}
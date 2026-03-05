/**
 * --------------------------------------------------------------------------
 * seasonality-bid-adjuster - Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Author: Thibault Fayol - Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */
var CONFIG = { TEST_MODE: true, EVENT_START: "2026-11-20", EVENT_END: "2026-11-30", BOOST_MULTIPLIER: 1.5 };
function main() {
    var todayStr = Utilities.formatDate(new Date(), AdsApp.currentAccount().getTimeZone(), "yyyy-MM-dd");
    var isEventActive = (todayStr >= CONFIG.EVENT_START && todayStr <= CONFIG.EVENT_END);
    var targetMod = isEventActive ? CONFIG.BOOST_MULTIPLIER : 1.0;
    var campIter = AdsApp.campaigns().withCondition("Status = ENABLED").get();
    while(campIter.hasNext()){
        var camp = campIter.next();
        var currentMod = camp.bidding().getBidModifier();
        if (currentMod !== targetMod) {
           Logger.log("Modificateur saisonnier pour " + camp.getName() + " -> " + targetMod);
           if(!CONFIG.TEST_MODE) camp.bidding().setBidModifier(targetMod);
        }
    }
}

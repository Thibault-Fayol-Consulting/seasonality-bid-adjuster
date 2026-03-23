/**
 * --------------------------------------------------------------------------
 * Seasonality Budget Adjuster — Google Ads Script
 * --------------------------------------------------------------------------
 * Adjusts campaign daily budgets based on monthly seasonality multipliers.
 * Uses budget adjustment (not bid modifiers) because Google Ads Scripts
 * cannot set campaign-level bid modifiers.
 *
 * Author : Thibault Fayol — Thibault Fayol Consulting
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  TEST_MODE: true,
  NOTIFICATION_EMAIL: 'you@example.com',

  // Monthly multipliers (index 0 = January, 11 = December)
  SEASONALITY_MULTIPLIERS: [
    1.0,  // Jan
    1.0,  // Feb
    1.0,  // Mar
    1.1,  // Apr
    1.2,  // May
    1.3,  // Jun
    1.5,  // Jul
    1.0,  // Aug
    1.2,  // Sep
    1.3,  // Oct
    1.5,  // Nov
    2.0   // Dec
  ],

  // Base daily budgets per campaign name. Campaigns not listed are skipped.
  BASE_BUDGETS: {
    'Campaign - Brand': 20,
    'Campaign - Generic': 50,
    'Campaign - Competitors': 30
  }
};

function main() {
  try {
    Logger.log('Seasonality Budget Adjuster — start');

    var tz = AdsApp.currentAccount().getTimeZone();
    var now = new Date();
    var today = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
    var monthIndex = parseInt(Utilities.formatDate(now, tz, 'MM'), 10) - 1;
    var multiplier = CONFIG.SEASONALITY_MULTIPLIERS[monthIndex];
    var accountName = AdsApp.currentAccount().getName();

    Logger.log('Month index: ' + monthIndex + ', multiplier: ' + multiplier);

    var campIter = AdsApp.campaigns()
      .withCondition('Status = ENABLED')
      .get();

    var changes = [];

    while (campIter.hasNext()) {
      var camp = campIter.next();
      var campName = camp.getName();
      var baseBudget = CONFIG.BASE_BUDGETS[campName];

      if (baseBudget === undefined) {
        continue;
      }

      var currentBudget = camp.getBudget().getAmount();
      var adjustedBudget = Math.round(baseBudget * multiplier * 100) / 100;

      if (currentBudget !== adjustedBudget) {
        Logger.log(campName + ': $' + currentBudget + ' -> $' + adjustedBudget +
          ' (base $' + baseBudget + ' x ' + multiplier + ')');

        if (!CONFIG.TEST_MODE) {
          camp.getBudget().setAmount(adjustedBudget);
        }

        changes.push({
          campaign: campName,
          from: currentBudget,
          to: adjustedBudget,
          base: baseBudget,
          multiplier: multiplier
        });
      }
    }

    var subject = '[Seasonality Adjuster] ' + accountName + ' — ' + today;
    var body = 'Seasonality Budget Adjuster Report\n' +
      'Date: ' + today + '\n' +
      'Month multiplier: ' + multiplier + '\n' +
      'Changes: ' + changes.length + '\n\n';

    if (changes.length > 0) {
      body += 'Campaign | Base | From | To\n';
      body += '---------|------|------|---\n';
      for (var i = 0; i < changes.length; i++) {
        var c = changes[i];
        body += c.campaign + ' | $' + c.base + ' | $' + c.from + ' | $' + c.to + '\n';
      }
    } else {
      body += 'No budget changes needed.\n';
    }

    body += '\n' + (CONFIG.TEST_MODE ? '(TEST MODE — no budgets changed)\n' : '');

    MailApp.sendEmail(CONFIG.NOTIFICATION_EMAIL, subject, body);
    Logger.log('Done. ' + changes.length + ' changes.');

  } catch (e) {
    Logger.log('ERROR: ' + e.message);
    MailApp.sendEmail(
      CONFIG.NOTIFICATION_EMAIL,
      '[Seasonality Adjuster] Error',
      'Script error:\n' + e.message + '\n' + e.stack
    );
  }
}

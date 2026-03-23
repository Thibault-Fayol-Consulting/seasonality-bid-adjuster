/**
 * --------------------------------------------------------------------------
 * Ajusteur de Budgets Saisonniers — Script Google Ads
 * --------------------------------------------------------------------------
 * Ajuste les budgets journaliers des campagnes en fonction de multiplicateurs
 * mensuels de saisonnalite. Utilise l'ajustement de budget (pas les
 * modificateurs d'encheres) car les Scripts Google Ads ne permettent pas
 * de definir des modificateurs au niveau campagne.
 *
 * Auteur : Thibault Fayol — Thibault Fayol Consulting
 * Site   : https://thibaultfayol.com
 * Licence: MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  TEST_MODE: true,
  NOTIFICATION_EMAIL: 'vous@exemple.com',

  SEASONALITY_MULTIPLIERS: [
    1.0, 1.0, 1.0, 1.1, 1.2, 1.3,
    1.5, 1.0, 1.2, 1.3, 1.5, 2.0
  ],

  BASE_BUDGETS: {
    'Campagne - Marque': 20,
    'Campagne - Generique': 50,
    'Campagne - Concurrents': 30
  }
};

function main() {
  try {
    Logger.log('Ajusteur de Budgets Saisonniers — demarrage');

    var tz = AdsApp.currentAccount().getTimeZone();
    var now = new Date();
    var today = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
    var monthIndex = parseInt(Utilities.formatDate(now, tz, 'MM'), 10) - 1;
    var multiplier = CONFIG.SEASONALITY_MULTIPLIERS[monthIndex];
    var accountName = AdsApp.currentAccount().getName();

    var campIter = AdsApp.campaigns()
      .withCondition('Status = ENABLED')
      .get();

    var changes = [];

    while (campIter.hasNext()) {
      var camp = campIter.next();
      var campName = camp.getName();
      var baseBudget = CONFIG.BASE_BUDGETS[campName];

      if (baseBudget === undefined) { continue; }

      var currentBudget = camp.getBudget().getAmount();
      var adjustedBudget = Math.round(baseBudget * multiplier * 100) / 100;

      if (currentBudget !== adjustedBudget) {
        Logger.log(campName + ' : ' + currentBudget + ' -> ' + adjustedBudget + ' EUR');
        if (!CONFIG.TEST_MODE) { camp.getBudget().setAmount(adjustedBudget); }
        changes.push({ campaign: campName, from: currentBudget, to: adjustedBudget });
      }
    }

    var subject = '[Saisonnalite] ' + accountName + ' — ' + today;
    var body = 'Rapport Ajustement Saisonnier\nDate : ' + today +
      '\nMultiplicateur : ' + multiplier +
      '\nModifications : ' + changes.length + '\n\n';

    for (var i = 0; i < changes.length; i++) {
      var c = changes[i];
      body += c.campaign + ' : ' + c.from + ' -> ' + c.to + ' EUR\n';
    }

    body += '\n' + (CONFIG.TEST_MODE ? '(MODE TEST)\n' : '');
    MailApp.sendEmail(CONFIG.NOTIFICATION_EMAIL, subject, body);
    Logger.log('Termine. ' + changes.length + ' modifications.');

  } catch (e) {
    Logger.log('ERREUR : ' + e.message);
    MailApp.sendEmail(CONFIG.NOTIFICATION_EMAIL, '[Saisonnalite] Erreur', e.message + '\n' + e.stack);
  }
}

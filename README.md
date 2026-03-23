# Seasonality Budget Adjuster

A Google Ads Script that automatically adjusts campaign daily budgets based on monthly seasonality multipliers.

## What It Does

- Applies a configurable multiplier to each campaign's base budget depending on the current month
- Sends an email report listing all budget changes
- Supports test mode to preview changes without applying them

**Important:** This script adjusts **daily budgets**, not bid modifiers. Google Ads Scripts cannot set campaign-level bid modifiers programmatically. Budget adjustment achieves a similar effect by scaling spend up or down during peak/off-peak months.

## Setup

1. In Google Ads, go to **Tools & Settings > Bulk Actions > Scripts**
2. Paste the contents of `main_en.gs` (or `main_fr.gs` for French)
3. Fill in `BASE_BUDGETS` with your campaign names and their normal daily budgets
4. Adjust `SEASONALITY_MULTIPLIERS` to match your business seasonality
5. Set `TEST_MODE` to `false` when ready
6. Schedule the script to run daily

## CONFIG Reference

| Parameter                 | Type    | Default         | Description                                                   |
|---------------------------|---------|-----------------|---------------------------------------------------------------|
| `TEST_MODE`               | Boolean | `true`          | When true, logs changes but does not modify budgets           |
| `NOTIFICATION_EMAIL`      | String  | —               | Email address for reports and error alerts                    |
| `SEASONALITY_MULTIPLIERS` | Array   | 12 values       | Multiplier for each month (index 0 = Jan, 11 = Dec)          |
| `BASE_BUDGETS`            | Object  | —               | Map of campaign names to their base daily budget amounts      |

## How It Works

1. Determines the current month using the account timezone
2. Looks up the multiplier for that month
3. For each campaign listed in `BASE_BUDGETS`, calculates `baseBudget * multiplier`
4. If the current budget differs from the calculated budget, applies the change
5. Sends an email report with all modifications

## Requirements

- Google Ads account with active campaigns
- Campaign names in `BASE_BUDGETS` must match exactly (case-sensitive)
- Google Ads Scripts access

## License

MIT — Thibault Fayol Consulting

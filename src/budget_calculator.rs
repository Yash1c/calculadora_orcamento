
use crate::transaction::Transaction;

pub struct BudgetCalculator;

impl BudgetCalculator {
    pub fn calculate_monthly_balance(transactions: &[Transaction]) -> f64 {
        transactions.iter().map(|t| t.amount).sum()
    }

    pub fn calculate_average_balance(transactions: &[Transaction], months: usize) -> f64 {
        let recent_transactions: Vec<_> = transactions.iter().rev().take(months).collect();
        if recent_transactions.is_empty() {
            0.0
        } else {
            recent_transactions.iter().map(|t| t.amount).sum::<f64>() / months as f64
        }
    }

    pub fn predict_next_month_balance(transactions: &[Transaction]) -> f64 {
        Self::calculate_average_balance(transactions, 3)
    }
}

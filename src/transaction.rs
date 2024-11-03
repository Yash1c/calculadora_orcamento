
use serde::{Deserialize, Serialize};
use chrono::NaiveDate;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Transaction {
    pub description: String,
    pub category: String,
    pub amount: f64,
    pub date: NaiveDate,
}

impl Transaction {
    pub fn new(description: &str, category: &str, amount: f64, date: NaiveDate) -> Self {
        Transaction {
            description: description.to_string(),
            category: category.to_string(),
            amount,
            date,
        }
    }
}

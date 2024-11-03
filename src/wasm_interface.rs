
use wasm_bindgen::prelude::*;
use serde_wasm_bindgen::{from_value, to_value};
use crate::transaction::Transaction;
use crate::budget_calculator::BudgetCalculator;

#[wasm_bindgen]
pub fn add_transaction(description: &str, category: &str, amount: f64, date: &str) -> JsValue {
    let date = NaiveDate::parse_from_str(date, "%Y-%m-%d").expect("Data inválida");
    let transaction = Transaction::new(description, category, amount, date);
    to_value(&transaction).unwrap()
}

#[wasm_bindgen]
pub fn get_monthly_balance(transactions: JsValue) -> f64 {
    let transactions: Vec<Transaction> = from_value(transactions).unwrap();
    BudgetCalculator::calculate_monthly_balance(&transactions)
}

#[wasm_bindgen]
pub fn predict_next_month(transactions: JsValue) -> f64 {
    let transactions: Vec<Transaction> = from_value(transactions).unwrap();
    BudgetCalculator::predict_next_month_balance(&transactions)
}

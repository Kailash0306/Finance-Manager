package com.backend.dto;

import java.math.BigDecimal;

public class PeriodSummary {

    private String periodLabel; // e.g. "2025-01", "2025-W05", "2025"
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private String totalIncomeDisplay;
    private String totalExpenseDisplay;
    private String balanceDisplay;

    public PeriodSummary() {
        this.totalIncome = BigDecimal.ZERO;
        this.totalExpense = BigDecimal.ZERO;
        this.balance = BigDecimal.ZERO;
    }

    public PeriodSummary(String periodLabel, BigDecimal totalIncome, BigDecimal totalExpense) {
        this.periodLabel = periodLabel;
        this.totalIncome = totalIncome != null ? totalIncome : BigDecimal.ZERO;
        this.totalExpense = totalExpense != null ? totalExpense : BigDecimal.ZERO;
        this.balance = this.totalIncome.subtract(this.totalExpense);
    }

    public String getPeriodLabel() {
        return periodLabel;
    }

    public void setPeriodLabel(String periodLabel) {
        this.periodLabel = periodLabel;
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpense() {
        return totalExpense;
    }

    public void setTotalExpense(BigDecimal totalExpense) {
        this.totalExpense = totalExpense;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public String getTotalIncomeDisplay() {
        return totalIncomeDisplay;
    }

    public void setTotalIncomeDisplay(String totalIncomeDisplay) {
        this.totalIncomeDisplay = totalIncomeDisplay;
    }

    public String getTotalExpenseDisplay() {
        return totalExpenseDisplay;
    }

    public void setTotalExpenseDisplay(String totalExpenseDisplay) {
        this.totalExpenseDisplay = totalExpenseDisplay;
    }

    public String getBalanceDisplay() {
        return balanceDisplay;
    }

    public void setBalanceDisplay(String balanceDisplay) {
        this.balanceDisplay = balanceDisplay;
    }
}

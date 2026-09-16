package com.backend.dto;

import java.math.BigDecimal;

public class CategorySummaryDto {

    private String category;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private Long transactionCount;
    private String totalIncomeDisplay;
    private String totalExpenseDisplay;

    public CategorySummaryDto() {
        this.totalIncome = BigDecimal.ZERO;
        this.totalExpense = BigDecimal.ZERO;
        this.transactionCount = 0L;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
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

    public Long getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(Long transactionCount) {
        this.transactionCount = transactionCount;
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
}

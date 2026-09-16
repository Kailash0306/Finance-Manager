package com.backend.service;

import com.backend.dto.CategorySummaryDto;
import com.backend.model.Transaction;
import com.backend.model.TransactionType;
import com.backend.repository.TransactionRepository;
import com.backend.util.MoneyFormat;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    /** Suggested categories from requirements: fuel, movie, food, loan, medical, and etc. */
    public static final List<String> SUGGESTED_CATEGORIES = List.of(
            "fuel", "movie", "food", "loan", "medical", "salary", "transport",
            "utilities", "entertainment", "shopping", "rent", "transfer", "other"
    );

    private final TransactionRepository transactionRepository;

    public CategoryService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<CategorySummaryDto> getCategorySummaries(String userId) {
        LocalDateTime start = LocalDateTime.now().minusYears(10);
        LocalDateTime end = LocalDateTime.now().plusDays(1);
        List<Transaction> all = transactionRepository.findInDateRange(userId, start, end);

        Map<String, CategorySummaryDto> map = new HashMap<>();
        for (Transaction t : all) {
            String cat = t.getCategory() != null ? t.getCategory() : "Uncategorized";
            CategorySummaryDto dto = map.computeIfAbsent(cat, k -> {
                CategorySummaryDto d = new CategorySummaryDto();
                d.setCategory(k);
                d.setTotalIncome(BigDecimal.ZERO);
                d.setTotalExpense(BigDecimal.ZERO);
                d.setTransactionCount(0L);
                return d;
            });
            if (t.getType() == TransactionType.INCOME) {
                dto.setTotalIncome(dto.getTotalIncome().add(t.getAmount()));
            } else {
                dto.setTotalExpense(dto.getTotalExpense().add(t.getAmount()));
            }
            dto.setTransactionCount(dto.getTransactionCount() + 1);
        }
        return map.values().stream()
                .peek(dto -> {
                    dto.setTotalIncomeDisplay(MoneyFormat.formatRupees(dto.getTotalIncome()));
                    dto.setTotalExpenseDisplay(MoneyFormat.formatRupees(dto.getTotalExpense()));
                })
                .sorted(Comparator.comparing(CategorySummaryDto::getCategory))
                .collect(Collectors.toList());
    }

    public List<String> getAllCategoryNames(String userId) {
        return getCategorySummaries(userId).stream()
                .map(CategorySummaryDto::getCategory)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public List<String> getSuggestedCategoryNames() {
        return new ArrayList<>(SUGGESTED_CATEGORIES);
    }
}

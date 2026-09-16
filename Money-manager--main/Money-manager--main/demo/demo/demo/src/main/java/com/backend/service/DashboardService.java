package com.backend.service;

import com.backend.dto.DashboardSummaryResponse;
import com.backend.dto.PeriodSummary;
import com.backend.model.Transaction;
import com.backend.model.TransactionType;
import com.backend.repository.TransactionRepository;
import com.backend.util.MoneyFormat;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final TransactionRepository transactionRepository;

    public DashboardService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public DashboardSummaryResponse getSummary(String userId, String periodType) {
        LocalDateTime start = LocalDateTime.now().minusYears(2);
        LocalDateTime end = LocalDateTime.now().plusDays(1);
        List<Transaction> all = transactionRepository.findInDateRange(userId, start, end);

        DashboardSummaryResponse response = new DashboardSummaryResponse();
        response.setPeriodType(periodType == null ? "monthly" : periodType.toLowerCase());

        switch (response.getPeriodType()) {
            case "weekly":
                response.setSummaries(aggregateByWeek(all));
                break;
            case "yearly":
                response.setSummaries(aggregateByYear(all));
                break;
            default:
                response.setSummaries(aggregateByMonth(all));
                break;
        }
        return response;
    }

    private List<PeriodSummary> aggregateByMonth(List<Transaction> transactions) {
        Map<YearMonth, BigDecimal> income = new HashMap<>();
        Map<YearMonth, BigDecimal> expense = new HashMap<>();
        for (Transaction t : transactions) {
            YearMonth ym = YearMonth.from(t.getDateTime());
            if (t.getType() == TransactionType.INCOME) {
                income.merge(ym, t.getAmount(), BigDecimal::add);
            } else {
                expense.merge(ym, t.getAmount(), BigDecimal::add);
            }
        }
        Set<YearMonth> allMonths = new HashSet<>();
        allMonths.addAll(income.keySet());
        allMonths.addAll(expense.keySet());
        return allMonths.stream()
                .sorted(Comparator.reverseOrder())
                .limit(24)
                .map(ym -> new PeriodSummary(ym.toString(), income.getOrDefault(ym, BigDecimal.ZERO), expense.getOrDefault(ym, BigDecimal.ZERO)))
                .peek(this::setPeriodSummaryDisplay)
                .collect(Collectors.toList());
    }

    private List<PeriodSummary> aggregateByWeek(List<Transaction> transactions) {
        WeekFields wf = WeekFields.of(Locale.getDefault());
        Map<String, BigDecimal> income = new HashMap<>();
        Map<String, BigDecimal> expense = new HashMap<>();
        for (Transaction t : transactions) {
            LocalDate d = t.getDateTime().toLocalDate();
            int year = d.get(wf.weekBasedYear());
            int week = d.get(wf.weekOfWeekBasedYear());
            String key = year + "-W" + String.format("%02d", week);
            if (t.getType() == TransactionType.INCOME) {
                income.merge(key, t.getAmount(), BigDecimal::add);
            } else {
                expense.merge(key, t.getAmount(), BigDecimal::add);
            }
        }
        Set<String> allWeeks = new HashSet<>();
        allWeeks.addAll(income.keySet());
        allWeeks.addAll(expense.keySet());
        return allWeeks.stream()
                .sorted(Comparator.reverseOrder())
                .limit(52)
                .map(key -> new PeriodSummary(key, income.getOrDefault(key, BigDecimal.ZERO), expense.getOrDefault(key, BigDecimal.ZERO)))
                .peek(this::setPeriodSummaryDisplay)
                .collect(Collectors.toList());
    }

    private List<PeriodSummary> aggregateByYear(List<Transaction> transactions) {
        Map<Integer, BigDecimal> income = new HashMap<>();
        Map<Integer, BigDecimal> expense = new HashMap<>();
        for (Transaction t : transactions) {
            int year = t.getDateTime().getYear();
            if (t.getType() == TransactionType.INCOME) {
                income.merge(year, t.getAmount(), BigDecimal::add);
            } else {
                expense.merge(year, t.getAmount(), BigDecimal::add);
            }
        }
        Set<Integer> allYears = new HashSet<>();
        allYears.addAll(income.keySet());
        allYears.addAll(expense.keySet());
        return allYears.stream()
                .sorted(Comparator.reverseOrder())
                .limit(10)
                .map(y -> new PeriodSummary(String.valueOf(y), income.getOrDefault(y, BigDecimal.ZERO), expense.getOrDefault(y, BigDecimal.ZERO)))
                .peek(this::setPeriodSummaryDisplay)
                .collect(Collectors.toList());
    }

    private void setPeriodSummaryDisplay(PeriodSummary ps) {
        ps.setTotalIncomeDisplay(MoneyFormat.formatRupees(ps.getTotalIncome()));
        ps.setTotalExpenseDisplay(MoneyFormat.formatRupees(ps.getTotalExpense()));
        ps.setBalanceDisplay(MoneyFormat.formatRupees(ps.getBalance()));
    }
}

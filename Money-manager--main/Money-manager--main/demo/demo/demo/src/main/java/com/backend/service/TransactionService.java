package com.backend.service;

import com.backend.dto.TransactionRequest;
import com.backend.dto.TransactionResponse;
import com.backend.exception.EditNotAllowedException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.model.Division;
import com.backend.model.Transaction;
import com.backend.model.TransactionType;
import com.backend.repository.TransactionRepository;
import com.backend.util.MoneyFormat;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import com.backend.config.LocalDateTimeConverters;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private static final int EDIT_WINDOW_HOURS = 12;

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public TransactionResponse create(String userId, TransactionRequest request) {
        Transaction t = new Transaction();
        t.setUserId(userId);
        mapRequestToTransaction(request, t);
        t.setCreatedAt(LocalDateTime.now(LocalDateTimeConverters.IST));
        t = transactionRepository.save(t);
        return toResponse(t);
    }

    public TransactionResponse update(String userId, String id, TransactionRequest request) {
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));
        if (!userId.equals(t.getUserId())) {
            throw new ResourceNotFoundException("Transaction not found: " + id);
        }
        if (!isWithinEditWindow(t.getCreatedAt())) {
            throw new EditNotAllowedException("Editing is only allowed within 12 hours of creation.");
        }
        mapRequestToTransaction(request, t);
        t.setUpdatedAt(LocalDateTime.now(LocalDateTimeConverters.IST));
        t = transactionRepository.save(t);
        return toResponse(t);
    }

    public TransactionResponse findById(String userId, String id) {
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));
        if (!userId.equals(t.getUserId())) {
            throw new ResourceNotFoundException("Transaction not found: " + id);
        }
        return toResponse(t);
    }

    public List<TransactionResponse> findAll(String userId, LocalDateTime startDate, LocalDateTime endDate,
                                             Division division, String category, TransactionType type) {
        LocalDateTime nowIst = LocalDateTime.now(LocalDateTimeConverters.IST);
        LocalDateTime start = startDate != null ? startDate : nowIst.minusYears(10);
        LocalDateTime end = endDate != null ? endDate : nowIst.plusYears(1);

        List<Transaction> list;
        if (type != null && division != null) {
            list = transactionRepository.findByUserIdAndTypeAndDivisionAndDateTimeBetweenOrderByDateTimeDesc(userId, type, division, start, end);
        } else if (type != null) {
            list = transactionRepository.findByUserIdAndTypeAndDateTimeBetweenOrderByDateTimeDesc(userId, type, start, end);
        } else if (division != null) {
            list = transactionRepository.findByUserIdAndDivisionAndDateTimeBetweenOrderByDateTimeDesc(userId, division, start, end);
        } else if (category != null && !category.isBlank()) {
            list = transactionRepository.findByUserIdAndCategoryAndDateTimeBetweenOrderByDateTimeDesc(userId, category.trim(), start, end);
        } else {
            list = transactionRepository.findByUserIdAndDateTimeBetweenOrderByDateTimeDesc(userId, start, end);
        }
        if (type != null) {
            list = list.stream().filter(t -> t.getType() == type).collect(Collectors.toList());
        }
        if (division != null) {
            list = list.stream().filter(t -> division.equals(t.getDivision())).collect(Collectors.toList());
        }
        if (category != null && !category.isBlank()) {
            String cat = category.trim();
            list = list.stream().filter(t -> cat.equals(t.getCategory())).collect(Collectors.toList());
        }
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public void delete(String userId, String id) {
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));
        if (!userId.equals(t.getUserId())) {
            throw new ResourceNotFoundException("Transaction not found: " + id);
        }
        if (!isWithinEditWindow(t.getCreatedAt())) {
            throw new EditNotAllowedException("Deletion is only allowed within 12 hours of creation.");
        }
        transactionRepository.delete(t);
    }

    public List<TransactionResponse> getHistory(String userId, int limit) {
        LocalDateTime nowIst = LocalDateTime.now(LocalDateTimeConverters.IST);
        List<Transaction> list = transactionRepository.findInDateRange(userId,
                nowIst.minusYears(1),
                nowIst.plusDays(1)
        );
        return list.stream()
                .sorted((a, b) -> b.getDateTime().compareTo(a.getDateTime()))
                .limit(limit <= 0 ? 100 : limit)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<Transaction> findByTransferId(String userId, String transferId) {
        return transactionRepository.findByUserIdAndTransferId(userId, transferId);
    }

    public List<Transaction> findInDateRange(String userId, LocalDateTime start, LocalDateTime end) {
        return transactionRepository.findByUserIdAndDateTimeBetweenOrderByDateTimeDesc(userId, start, end);
    }

    private void mapRequestToTransaction(TransactionRequest request, Transaction t) {
        t.setType(request.getType());
        t.setAmount(request.getAmount());
        t.setDateTime(request.getDateTime());
        t.setDescription(request.getDescription());
        t.setCategory(request.getCategory());
        t.setDivision(request.getDivision());
        t.setAccountId(request.getAccountId());
    }

    private TransactionResponse toResponse(Transaction t) {
        TransactionResponse r = new TransactionResponse();
        r.setId(t.getId());
        r.setType(t.getType());
        r.setAmount(t.getAmount());
        r.setAmountDisplay(MoneyFormat.formatRupees(t.getAmount()));
        r.setDateTime(t.getDateTime());
        r.setDescription(t.getDescription());
        r.setCategory(t.getCategory());
        r.setDivision(t.getDivision());
        r.setAccountId(t.getAccountId());
        r.setCreatedAt(t.getCreatedAt());
        r.setUpdatedAt(t.getUpdatedAt());
        r.setTransferId(t.getTransferId());
        r.setEditable(isWithinEditWindow(t.getCreatedAt()));
        return r;
    }

    /**
     * Edit is allowed only within 12 hours of creation.
     * createdAt is in IST; compare as instant for correct elapsed time.
     */
    private boolean isWithinEditWindow(LocalDateTime createdAt) {
        if (createdAt == null) return false;
        Instant createdInstant = createdAt.atZone(LocalDateTimeConverters.IST).toInstant();
        Instant now = Instant.now();
        long hours = ChronoUnit.HOURS.between(createdInstant, now);
        return hours >= 0 && hours < EDIT_WINDOW_HOURS;
    }
}

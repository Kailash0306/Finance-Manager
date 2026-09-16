package com.backend.controller;

import com.backend.dto.TransactionRequest;
import com.backend.dto.TransactionResponse;
import com.backend.model.Division;
import com.backend.model.TransactionType;
import com.backend.service.TransactionService;
import com.backend.util.AuthUtil;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    private static String requireUserId() {
        String userId = AuthUtil.currentUserId();
        if (userId == null) {
            throw new IllegalStateException("Not authenticated");
        }
        return userId;
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(@Valid @RequestBody TransactionRequest request) {
        String userId = requireUserId();
        TransactionResponse created = transactionService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> update(@PathVariable String id,
                                                      @Valid @RequestBody TransactionRequest request) {
        String userId = requireUserId();
        TransactionResponse updated = transactionService.update(userId, id, request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getById(@PathVariable String id) {
        String userId = requireUserId();
        return ResponseEntity.ok(transactionService.findById(userId, id));
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) Division division,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) TransactionType type) {
        String userId = requireUserId();
        List<TransactionResponse> list = transactionService.findAll(userId, startDate, endDate, division, category, type);
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        String userId = requireUserId();
        transactionService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}

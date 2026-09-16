package com.backend.controller;

import com.backend.model.TransactionType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transaction-types")
public class TransactionTypeController {

    @GetMapping
    public ResponseEntity<List<TransactionType>> getAll() {
        List<TransactionType> types = List.of(TransactionType.INCOME, TransactionType.EXPENSE);
        return ResponseEntity.ok(types);
    }
}

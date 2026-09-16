package com.backend.controller;

import com.backend.dto.DashboardSummaryResponse;
import com.backend.dto.TransactionResponse;
import com.backend.service.DashboardService;
import com.backend.service.TransactionService;
import com.backend.util.AuthUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final TransactionService transactionService;

    public DashboardController(DashboardService dashboardService, TransactionService transactionService) {
        this.dashboardService = dashboardService;
        this.transactionService = transactionService;
    }

    private static String requireUserId() {
        String userId = AuthUtil.currentUserId();
        if (userId == null) throw new IllegalStateException("Not authenticated");
        return userId;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary(
            @RequestParam(defaultValue = "monthly") String period) {
        String userId = requireUserId();
        DashboardSummaryResponse summary = dashboardService.getSummary(userId, period);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/history")
    public ResponseEntity<List<TransactionResponse>> getHistory(
            @RequestParam(defaultValue = "50") int limit) {
        String userId = requireUserId();
        List<TransactionResponse> history = transactionService.getHistory(userId, limit);
        return ResponseEntity.ok(history);
    }
}

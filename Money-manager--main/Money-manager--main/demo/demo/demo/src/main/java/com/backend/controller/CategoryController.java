package com.backend.controller;

import com.backend.dto.CategorySummaryDto;
import com.backend.service.CategoryService;
import com.backend.util.AuthUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    private static String requireUserId() {
        String userId = AuthUtil.currentUserId();
        if (userId == null) throw new IllegalStateException("Not authenticated");
        return userId;
    }

    @GetMapping
    public ResponseEntity<List<CategorySummaryDto>> getCategorySummaries() {
        String userId = requireUserId();
        List<CategorySummaryDto> summaries = categoryService.getCategorySummaries(userId);
        return ResponseEntity.ok(summaries);
    }

    @GetMapping("/names")
    public ResponseEntity<List<String>> getCategoryNames() {
        String userId = requireUserId();
        return ResponseEntity.ok(categoryService.getAllCategoryNames(userId));
    }

    @GetMapping("/suggested")
    public ResponseEntity<List<String>> getSuggestedCategories() {
        return ResponseEntity.ok(categoryService.getSuggestedCategoryNames());
    }
}

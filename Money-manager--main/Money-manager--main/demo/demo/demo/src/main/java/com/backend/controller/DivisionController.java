package com.backend.controller;

import com.backend.model.Division;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/divisions")
public class DivisionController {

    @GetMapping
    public ResponseEntity<List<Division>> getAll() {
        // Explicit use of both OFFICE and PERSONAL enum values
        List<Division> divisions = List.of(Division.OFFICE, Division.PERSONAL);
        return ResponseEntity.ok(divisions);
    }
}

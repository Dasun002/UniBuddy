package com.unibuddy.backend.controller;

import com.unibuddy.backend.model.AcademicResult;
import com.unibuddy.backend.service.AcademicResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/academic")
@CrossOrigin(origins = "*")
public class AcademicResultController {

    @Autowired
    private AcademicResultService academicService;

    @PostMapping
    public ResponseEntity<AcademicResult> addResult(@RequestBody AcademicResult result) {
        return ResponseEntity.ok(academicService.saveResult(result));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AcademicResult>> getResults(@PathVariable String studentId) {
        return ResponseEntity.ok(academicService.getResultsByStudent(studentId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AcademicResult> updateResult(@PathVariable Long id, @RequestBody AcademicResult result) {
        return ResponseEntity.ok(academicService.updateResult(id, result));
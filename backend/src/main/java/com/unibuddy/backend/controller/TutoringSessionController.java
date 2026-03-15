package com.unibuddy.backend.controller;

import com.unibuddy.backend.model.TutoringSession;
import com.unibuddy.backend.service.TutoringSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tutoring")
@CrossOrigin(origins = "*")
public class TutoringSessionController {

    @Autowired
    private TutoringSessionService service;
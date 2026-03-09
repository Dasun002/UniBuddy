package com.unibuddy.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.unibuddy.backend.model.TutoringSession;
import com.unibuddy.backend.repository.TutoringSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IncidentService } from '../../services/incident.service';
import { AuthService } from '../../services/auth.service';
import { PdfService } from '../../services/pdf.service';
import { Incident, IncidentStatus, IncidentSeverity } from '../../models/incident.model';

@Component({
  selector: 'app-incident-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './incident-details.component.html',
  styleUrls: ['./incident-details.component.css']
})
export class IncidentDetailsComponent implements OnInit {
  incident: Incident | undefined;
  isLoading = true;
  isAdmin = false;
  isSecurity = false;
  IncidentStatus = IncidentStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private incidentService: IncidentService,
    private authService: AuthService,
    private pdfService: PdfService
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    this.isSecurity = this.authService.isSecurity();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadIncident(id);
    }
  }

  loadIncident(id: string) {
    this.incidentService.getIncidentById(id).subscribe(data => {
      this.incident = data;
      this.isLoading = false;
    });
  }

  updateStatus(newStatus: IncidentStatus) {
    if (this.incident) {
      this.incidentService.updateIncident(this.incident.id, { status: newStatus }).subscribe(success => {
        if (success) {
          this.loadIncident(this.incident!.id);
        }
      });
    }
  }

  deleteIncident() {
    if (this.incident && confirm('Are you sure you want to delete this incident?')) {
      this.incidentService.deleteIncident(this.incident.id).subscribe(success => {
        if (success) {
          this.router.navigate(['/incidents']);
        }
      });
    }
  }

  getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      'critical': '#dc3545',
      'high': '#fd7e14',
      'medium': '#ffc107',
      'low': '#28a745'
    };
    return colors[severity] || '#6c757d';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'reported': '#007bff',
      'investigating': '#fd7e14',
      'resolved': '#28a745',
      'closed': '#6c757d',
      'false_alarm': '#6f42c1'
    };
    return colors[status] || '#6c757d';
  }

  canUpdateStatus(): boolean {
    return this.isAdmin || this.isSecurity;
  }

  canDeleteIncident(): boolean {
    return this.isAdmin;
  }

  goBack() {
    this.router.navigate(['/incidents']);
  }

  editIncident() {
    // Navigate to edit incident page (to be implemented)
    console.log('Edit incident functionality to be implemented');
  }

  printIncident() {
    if (this.incident) {
      this.pdfService.generateIncidentPDF(this.incident);
    }
  }

  downloadIncidentPDF() {
    console.log('PDF download button clicked');
    if (this.incident) {
      console.log('Incident data available:', this.incident.id);
      this.pdfService.downloadIncidentPDF(this.incident);
    } else {
      console.error('No incident data available');
      alert('No incident data available. Please try again.');
    }
  }

  shareIncidentReport() {
    if (this.incident) {
      this.pdfService.shareIncidentReport(this.incident);
    }
  }

  getTimeElapsed(reportDate: Date): string {
    const now = new Date();
    const reported = new Date(reportDate);
    const diffInHours = Math.floor((now.getTime() - reported.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Less than 1 hour';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
    }
  }
}

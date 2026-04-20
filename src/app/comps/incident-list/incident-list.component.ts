import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IncidentService } from '../../services/incident.service';
import { AuthService } from '../../services/auth.service';
import { Incident, IncidentStatus, IncidentSeverity } from '../../models/incident.model';

@Component({
  selector: 'app-incident-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './incident-list.component.html',
  styleUrls: ['./incident-list.component.css']
})
export class IncidentListComponent implements OnInit {
  incidents: Incident[] = [];
  filteredIncidents: Incident[] = [];
  statusFilter = '';
  severityFilter = '';
  searchTerm = '';
  isLoading = false;
  isAdmin = false;

  statuses = Object.values(IncidentStatus);
  severities = Object.values(IncidentSeverity);

  constructor(
    private incidentService: IncidentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    this.loadIncidents();
  }

  loadIncidents() {
    this.isLoading = true;
    this.incidentService.getIncidents().subscribe(data => {
      this.incidents = data;
      this.applyFilters();
      this.isLoading = false;
    });
  }

  applyFilters() {
    this.filteredIncidents = this.incidents.filter(incident => {
      const matchesStatus = !this.statusFilter || incident.status === this.statusFilter;
      const matchesSeverity = !this.severityFilter || incident.severity === this.severityFilter;
      const matchesSearch = !this.searchTerm || 
        incident.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        incident.location.address.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesStatus && matchesSeverity && matchesSearch;
    });
  }

  onFilterChange() {
    this.applyFilters();
  }

  updateIncidentStatus(incidentId: string, newStatus: IncidentStatus) {
    this.incidentService.updateIncident(incidentId, { status: newStatus }).subscribe(success => {
      if (success) {
        this.loadIncidents();
      }
    });
  }

  deleteIncident(incidentId: string) {
    if (confirm('Are you sure you want to delete this incident?')) {
      this.incidentService.deleteIncident(incidentId).subscribe(success => {
        if (success) {
          this.loadIncidents();
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
    return this.isAdmin || this.authService.isSecurity();
  }

  canDeleteIncident(): boolean {
    return this.isAdmin;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
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
  incidents$ = this.incidentService.getIncidents();
  filteredIncidents$: Observable<Incident[]>;
  private statusFilterSubject = new BehaviorSubject<string>('');
  private severityFilterSubject = new BehaviorSubject<string>('');
  private searchTermSubject = new BehaviorSubject<string>('');
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
    this.filteredIncidents$ = combineLatest([
      this.incidents$,
      this.statusFilterSubject.asObservable(),
      this.severityFilterSubject.asObservable(),
      this.searchTermSubject.asObservable()
    ]).pipe(
      map(([incidents, statusFilter, severityFilter, searchTerm]) => {
        return incidents.filter(incident => {
          const matchesStatus = !statusFilter || incident.status === statusFilter;
          const matchesSeverity = !severityFilter || incident.severity === severityFilter;
          const matchesSearch = !searchTerm || 
            incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            incident.location.address.toLowerCase().includes(searchTerm.toLowerCase());
          return matchesStatus && matchesSeverity && matchesSearch;
        });
      })
    );
  }

  get statusFilter(): string {
    return this.statusFilterSubject.value;
  }

  set statusFilter(value: string) {
    this.statusFilterSubject.next(value);
  }

  get severityFilter(): string {
    return this.severityFilterSubject.value;
  }

  set severityFilter(value: string) {
    this.severityFilterSubject.next(value);
  }

  get searchTerm(): string {
    return this.searchTermSubject.value;
  }

  set searchTerm(value: string) {
    this.searchTermSubject.next(value);
  }

  updateIncidentStatus(incidentId: string, newStatus: IncidentStatus) {
    this.incidentService.updateIncident(incidentId, { status: newStatus }).subscribe();
  }

  deleteIncident(incidentId: string) {
    if (confirm('Are you sure you want to delete this incident?')) {
      this.incidentService.deleteIncident(incidentId).subscribe();
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

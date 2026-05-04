import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IncidentService } from '../../services/incident.service';
import { User, UserRole } from '../../models/incident.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  stats: any = {};
  recentIncidents: any[] = [];
  UserRole = UserRole;

  constructor(
    private authService: AuthService,
    private incidentService: IncidentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      this.loadDashboardData();
    });
  }

  private loadDashboardData() {
    if (this.authService.isAdmin()) {
      this.loadAdminData();
    } else {
      this.loadUserData();
    }
  }

  private loadAdminData() {
    this.stats = this.incidentService.getAdminStats();
    this.incidentService.getIncidents().subscribe(incidents => {
      this.recentIncidents = incidents
        .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
        .slice(0, 5);
    });
  }

  private loadUserData() {
    if (this.currentUser) {
      this.incidentService.getIncidentsByReporter(this.currentUser.id).subscribe(incidents => {
        this.stats = {
          totalIncidents: incidents.length,
          openIncidents: incidents.filter(i => i.status === 'reported').length,
          resolvedIncidents: incidents.filter(i => i.status === 'resolved').length
        };
        this.recentIncidents = incidents
          .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
          .slice(0, 5);
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
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

  viewIncident(incidentId: string) {
    this.router.navigate(['/incidents', incidentId]);
  }

  createIncident() {
    this.router.navigate(['/report']);
  }

  viewMap() {
    this.router.navigate(['/map']);
  }

  viewAllIncidents() {
    this.router.navigate(['/incidents']);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isSecurity(): boolean {
    return this.authService.isSecurity();
  }

  getCategoryDisplayName(key: any): string {
    return (key as string).replace('_', ' ').toUpperCase();
  }

  getSeverityDisplayName(key: any): string {
    return (key as string).toUpperCase();
  }

  getSeverityColorFromKey(key: any): string {
    return this.getSeverityColor(key as string);
  }
}

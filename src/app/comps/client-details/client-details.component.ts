import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CommissionService } from '../../services/commission.service';
import { Client, CommissionStatus } from '../../models/commission.model';

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.css']
})
export class ClientDetailsComponent implements OnInit {
  client: Client | undefined;
  clientCommissions: any[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private commissionService: CommissionService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClientData(id);
    }
  }

  loadClientData(clientId: string) {
    this.commissionService.getClientById(clientId).subscribe(clientData => {
      this.client = clientData;
      this.loadClientCommissions(clientId);
    });
  }

  loadClientCommissions(clientId: string) {
    this.commissionService.getCommissions().subscribe(commissions => {
      this.clientCommissions = commissions.filter(c => c.clientId === clientId);
      this.isLoading = false;
    });
  }

  getStatusColor(status: CommissionStatus): string {
    switch (status) {
      case CommissionStatus.REQUESTED: return 'warning';
      case CommissionStatus.ACCEPTED: return 'info';
      case CommissionStatus.IN_PROGRESS: return 'primary';
      case CommissionStatus.REVIEW: return 'secondary';
      case CommissionStatus.COMPLETED: return 'success';
      case CommissionStatus.CANCELLED: return 'danger';
      default: return 'secondary';
    }
  }

  getRelationshipLength(createdAt: Date): string {
    const now = new Date();
    const created = new Date(createdAt);
    const months = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (months < 1) return 'Less than 1 month';
    if (months === 1) return '1 month';
    if (months < 12) return `${months} months`;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  }

  getActivityLevel(totalCommissions: number): string {
    if (totalCommissions === 0) return 'No Activity';
    if (totalCommissions <= 2) return 'Low';
    if (totalCommissions <= 5) return 'Medium';
    return 'High';
  }
}

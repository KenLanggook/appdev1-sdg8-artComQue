import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommissionService } from '../../services/commission.service';
import { Commission, CommissionStatus } from '../../models/commission.model';

@Component({
  selector: 'app-commission-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './commission-list.component.html',
  styleUrls: ['./commission-list.component.css']
})
export class CommissionListComponent implements OnInit {
  commissions: Commission[] = [];
  filteredCommissions: Commission[] = [];
  statusFilter = '';
  searchTerm = '';
  CommissionStatus = CommissionStatus;

  constructor(private commissionService: CommissionService) {}

  ngOnInit() {
    this.loadCommissions();
  }

  loadCommissions() {
    this.commissionService.getCommissions().subscribe(data => {
      this.commissions = data;
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredCommissions = this.commissions.filter(commission => {
      const matchesStatus = !this.statusFilter || commission.status === this.statusFilter;
      const matchesSearch = !this.searchTerm || 
        commission.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        commission.clientName.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  updateCommissionStatus(commissionId: string, newStatus: CommissionStatus) {
    this.commissionService.updateCommission(commissionId, { status: newStatus });
    this.loadCommissions();
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
}

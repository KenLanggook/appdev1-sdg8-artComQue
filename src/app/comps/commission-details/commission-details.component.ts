import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CommissionService } from '../../services/commission.service';
import { Commission, CommissionStatus } from '../../models/commission.model';

@Component({
  selector: 'app-commission-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './commission-details.component.html',
  styleUrls: ['./commission-details.component.css']
})
export class CommissionDetailsComponent implements OnInit {
  commission: Commission | undefined;
  isLoading = true;
  CommissionStatus = CommissionStatus;

  constructor(
    private route: ActivatedRoute,
    private commissionService: CommissionService,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.commissionService.getCommissionById(id).subscribe(data => {
        this.commission = data;
        this.isLoading = false;
      });
    }
  }

  updateStatus(newStatus: CommissionStatus) {
    if (this.commission) {
      this.commissionService.updateCommission(this.commission.id, { status: newStatus });
      this.router.navigate(['/commissions']);
    }
  }

  deleteCommission() {
    if (this.commission && confirm('Are you sure you want to delete this commission?')) {
      this.commissionService.deleteCommission(this.commission.id);
      this.router.navigate(['/commissions']);
    }
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

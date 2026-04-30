import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommissionService } from '../../services/commission.service';
import { Commission, CommissionStatus, CommissionPriority, ArtworkType, Client } from '../../models/commission.model';

@Component({
  selector: 'app-create-commission',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-commission.component.html',
  styleUrls: ['./create-commission.component.css']
})
export class CreateCommissionComponent {
  clients: Client[] = [];
  
  newCommission: Partial<Commission> = {
    title: '',
    description: '',
    clientId: '',
    clientName: '',
    clientEmail: '',
    status: CommissionStatus.REQUESTED,
    priority: CommissionPriority.MEDIUM,
    price: 0,
    deadline: new Date(),
    progress: 0,
    artworkType: ArtworkType.DIGITAL_ART,
    specifications: '',
    referenceImages: [],
    milestones: [],
    payments: []
  };

  artworkTypes = Object.values(ArtworkType);
  priorities = Object.values(CommissionPriority);
  statusValues = Object.values(CommissionStatus);

  constructor(
    private commissionService: CommissionService,
    private router: Router
  ) {
    this.loadClients();
  }

  loadClients() {
    this.commissionService.getClients().subscribe(clients => {
      this.clients = clients;
    });
  }

  onClientChange() {
    const selectedClient = this.clients.find(c => c.id === this.newCommission.clientId);
    if (selectedClient) {
      this.newCommission.clientName = selectedClient.name;
      this.newCommission.clientEmail = selectedClient.email;
    }
  }

  onSubmit() {
    if (this.validateForm()) {
      this.commissionService.createCommission(this.newCommission as Omit<Commission, 'id' | 'createdAt' | 'updatedAt'>);
      this.router.navigate(['/commissions']);
    }
  }

  validateForm(): boolean {
    return !!(this.newCommission.title && 
              this.newCommission.description && 
              this.newCommission.clientId &&
              (this.newCommission.price || 0) > 0 &&
              this.newCommission.deadline);
  }

  cancel() {
    this.router.navigate(['/commissions']);
  }
}

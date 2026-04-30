import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommissionService } from '../../services/commission.service';
import { Client } from '../../models/commission.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchTerm = '';

  constructor(private commissionService: CommissionService) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.commissionService.getClients().subscribe(data => {
      this.clients = data;
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredClients = this.clients.filter(client => 
      !this.searchTerm || 
      client.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  onSearchChange() {
    this.applyFilters();
  }
}

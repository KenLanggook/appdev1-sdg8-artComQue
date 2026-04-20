import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-suppliers-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './suppliers-list.component.html',
  styleUrls: ['./suppliers-list.component.css']
})
export class SuppliersListComponent {
  suppliers = [
    { id: 1, name: 'Tech Supplies Inc', location: 'New York' },
    { id: 2, name: 'Global Hardware', location: 'Los Angeles' },
    { id: 3, name: 'Office Solutions', location: 'Chicago' }
  ];
  
  constructor() { }
}

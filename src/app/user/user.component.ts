import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class ProductSearchComponent {
  searchTerm = '';
  products = [
    { id: 1, name: 'Laptop', category: 'Electronics' },
    { id: 2, name: 'Mouse', category: 'Electronics' },
    { id: 3, name: 'Desk', category: 'Furniture' }
  ];
  
  constructor() { }
  
  get filteredProducts() {
    return this.products.filter(product => 
      product.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}

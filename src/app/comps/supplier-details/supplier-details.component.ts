import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-supplier-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './supplier-details.component.html',
  styleUrls: ['./supplier-details.component.css']
})
export class SupplierDetailsComponent {
  supplier: any;
  
  constructor(private route: ActivatedRoute) {
    const supplierId = this.route.snapshot.paramMap.get('id');
    this.supplier = {
      id: supplierId,
      name: `Supplier ${supplierId}`,
      location: `City ${supplierId}`,
      email: `supplier${supplierId}@example.com`,
      phone: `555-${supplierId}000`
    };
  }
}

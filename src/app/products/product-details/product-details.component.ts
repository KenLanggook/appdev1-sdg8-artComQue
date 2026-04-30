import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent {
  product: any;
  
  constructor(private route: ActivatedRoute) {
    const productId = this.route.snapshot.paramMap.get('id');
    this.product = {
      id: productId,
      name: `Product ${productId}`,
      price: Math.floor(Math.random() * 1000),
      description: `This is a detailed description for product ${productId}`
    };
  }
}

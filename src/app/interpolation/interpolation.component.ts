import { Component } from '@angular/core';

@Component({
  selector: 'app-interpolation',
  standalone: true,
  templateUrl: './interpolation.component.html',
  styleUrls: ['./interpolation.component.css']
})
export class InterpolationComponent {
  title = 'Interpolation Demo';
  message = 'This demonstrates data binding with {{ }} syntax';
  currentTime = new Date().toLocaleString();
  
  constructor() { }
}

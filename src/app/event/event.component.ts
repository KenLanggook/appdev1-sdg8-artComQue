import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventBinding {
  message = '';
  clickCount = 0;
  
  constructor() { }
  
  handleClick() {
    this.clickCount++;
    this.message = `Button clicked ${this.clickCount} times`;
  }
  
  handleMouseOver() {
    console.log('Mouse over event triggered');
  }
}

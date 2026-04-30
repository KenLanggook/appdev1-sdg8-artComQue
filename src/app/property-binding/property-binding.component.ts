import { Component } from '@angular/core';

@Component({
  selector: 'app-property-binding',
  standalone: true,
  templateUrl: './property-binding.component.html',
  styleUrls: ['./property-binding.component.css']
})
export class PropertyBinding {
  imageUrl = 'https://via.placeholder.com/150';
  isDisabled = false;
  inputText = 'Default text';
  
  constructor() { }
  
  toggleDisable() {
    this.isDisabled = !this.isDisabled;
  }
}

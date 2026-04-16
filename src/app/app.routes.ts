import { Routes } from '@angular/router';
import { HomeComponent } from './comps/home/home.component';
import { InterpolationComponent } from './interpolation/interpolation.component';
import { PropertyBinding } from './property-binding/property-binding.component';
import { EventBinding } from './event/event.component';
import { TwoWayBinding } from './two-way/two-way.component';
import { ProductListComponent } from './products/product-list/product-list.component';
import { ProductDetailsComponent } from './products/product-details/product-details.component';
import { ProductSearchComponent } from './user/user.component';
import { SuppliersListComponent } from './comps/suppliers-list/suppliers-list.component';
import { SupplierDetailsComponent } from './comps/supplier-details/supplier-details.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'interpolation', component: InterpolationComponent },
  { path: 'property-binding', component: PropertyBinding },
  { path: 'event', component: EventBinding },
  { path: 'two-way', component: TwoWayBinding },
  { path: 'suppliers', component: SuppliersListComponent },
  { path: 'suppliers/:id', component: SupplierDetailsComponent },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'user', component: ProductSearchComponent },
  { path: '**', redirectTo: 'home' }
];

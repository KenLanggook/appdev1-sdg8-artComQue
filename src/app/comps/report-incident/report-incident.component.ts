import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IncidentService } from '../../services/incident.service';
import { 
  Incident, 
  IncidentCategory, 
  IncidentSeverity, 
  Location, 
  ContactInfo 
} from '../../models/incident.model';

@Component({
  selector: 'app-report-incident',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-incident.component.html',
  styleUrls: ['./report-incident.component.css']
})
export class ReportIncidentComponent {
  currentUser: any = null;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Form data
  incidentData = {
    title: '',
    description: '',
    category: IncidentCategory.OTHER,
    severity: IncidentSeverity.MEDIUM,
    location: {
      latitude: 16.4166, // University of Baguio center (Gen. Luna Road)
      longitude: 120.5931,
      address: '',
      building: '',
      floor: '',
      room: '',
      landmark: ''
    } as Location,
    contactInfo: {
      name: '',
      email: '',
      phone: '',
      studentId: '',
      department: ''
    } as ContactInfo,
    witnesses: [] as string[],
    additionalNotes: '',
    isAnonymous: false
  };

  // Options
  categories = Object.values(IncidentCategory);
  severities = Object.values(IncidentSeverity);
  witnessInput = '';

  // Map related
  showMap = false;
  selectedLocation = { lat: 16.4106, lng: 120.5951 };

  constructor(
    private authService: AuthService,
    private incidentService: IncidentService,
    private router: Router
  ) {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.incidentData.contactInfo.name = `${user.profile.firstName} ${user.profile.lastName}`;
        this.incidentData.contactInfo.email = user.email;
        this.incidentData.contactInfo.phone = user.profile.phone || '';
        this.incidentData.contactInfo.studentId = user.profile.studentId || '';
        this.incidentData.contactInfo.department = user.profile.department || '';
      }
    });
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const incident: Omit<Incident, 'id' | 'reportedAt' | 'updatedAt'> = {
      title: this.incidentData.title,
      description: this.incidentData.description,
      category: this.incidentData.category,
      severity: this.incidentData.severity,
      status: 'reported' as any,
      location: this.incidentData.location,
      reportedBy: this.currentUser?.id || 'anonymous',
      images: [],
      witnesses: this.incidentData.witnesses,
      contactInfo: this.incidentData.isAnonymous ? {
        name: 'Anonymous',
        email: 'anonymous@ub.edu.ph'
      } : this.incidentData.contactInfo,
      additionalNotes: this.incidentData.additionalNotes,
      isAnonymous: this.incidentData.isAnonymous
    };

    this.incidentService.createIncident(incident).subscribe(
      (createdIncident) => {
        this.isSubmitting = false;
        this.successMessage = 'Incident reported successfully! Redirecting to dashboard...';
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to report incident. Please try again.';
      }
    );
  }

  private validateForm(): boolean {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.incidentData.title.trim()) {
      this.errorMessage = 'Please provide the incident title';
      return false;
    }

    if (!this.incidentData.description.trim()) {
      this.errorMessage = 'Please provide the incident description';
      return false;
    }

    if (!this.incidentData.location.address.trim()) {
      this.errorMessage = 'Please provide the incident location';
      return false;
    }

    // Validate that location is within University of Baguio campus boundaries
    if (!this.isWithinCampusBounds(this.incidentData.location.latitude, this.incidentData.location.longitude)) {
      this.errorMessage = 'Incidents can only be reported within University of Baguio campus boundaries. Please select a location within the campus area.';
      return false;
    }

    if (!this.incidentData.isAnonymous && (!this.incidentData.contactInfo.name || !this.incidentData.contactInfo.email)) {
      this.errorMessage = 'Please provide contact information';
      return false;
    }

    return true;
  }

  private isWithinCampusBounds(latitude: number, longitude: number): boolean {
    // University of Baguio campus boundaries (Gen. Luna Road)
    const CAMPUS_BOUNDS = {
      southwest: [16.4140, 120.5910],
      northeast: [16.4190, 120.5950]
    };

    return latitude >= CAMPUS_BOUNDS.southwest[0] && 
           latitude <= CAMPUS_BOUNDS.northeast[0] &&
           longitude >= CAMPUS_BOUNDS.southwest[1] && 
           longitude <= CAMPUS_BOUNDS.northeast[1];
  }

  addWitness() {
    if (this.witnessInput.trim()) {
      this.incidentData.witnesses.push(this.witnessInput.trim());
      this.witnessInput = '';
    }
  }

  removeWitness(index: number) {
    this.incidentData.witnesses.splice(index, 1);
  }

  toggleMap() {
    this.showMap = !this.showMap;
  }

  onLocationSelect(location: { lat: number; lng: number }) {
    this.selectedLocation = location;
    this.incidentData.location.latitude = location.lat;
    this.incidentData.location.longitude = location.lng;
  }

  // Quick location presets
  setQuickLocation(location: string) {
    const locations: Record<string, string> = {
      'Main Library': 'University of Baguio Main Library',
      'Gymnasium': 'University Gymnasium',
      'Parking Lot': 'Faculty Parking Lot',
      'Administration': 'Administration Building',
      'Cafeteria': 'University Cafeteria'
    };
    
    this.incidentData.location.address = locations[location] || location;
  }

  cancel() {
    this.router.navigate(['/']);
  }
}

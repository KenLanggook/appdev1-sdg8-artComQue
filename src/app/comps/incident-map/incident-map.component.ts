import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidentService } from '../../services/incident.service';
import { AuthService } from '../../services/auth.service';
import { MapMarker, Incident } from '../../models/incident.model';

declare var L: any;

@Component({
  selector: 'app-incident-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './incident-map.component.html',
  styleUrls: ['./incident-map.component.css']
})
export class IncidentMapComponent implements OnInit, AfterViewInit {
  markers: MapMarker[] = [];
  selectedIncident: Incident | null = null;
  map: any;
  isUserAuthenticated = false;
  isAdmin = false;
  mapInitialized = false;
  incidentMarkers: any[] = [];

  // University of Baguio coordinates from 16°24'56"N, 120°35'51"E
  private readonly UB_LATITUDE = 16.415556;
  private readonly UB_LONGITUDE = 120.5975;
  
  // University of Baguio campus boundaries relative to map center
  private readonly CAMPUS_BOUNDARY_OFFSET = 0.0025;

  private getCampusBounds() {
    return {
      southwest: [
        this.UB_LATITUDE - this.CAMPUS_BOUNDARY_OFFSET,
        this.UB_LONGITUDE - this.CAMPUS_BOUNDARY_OFFSET
      ],
      northeast: [
        this.UB_LATITUDE + this.CAMPUS_BOUNDARY_OFFSET,
        this.UB_LONGITUDE + this.CAMPUS_BOUNDARY_OFFSET
      ]
    };
  }

  constructor(
    private incidentService: IncidentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadMarkers();
    this.checkAuthStatus();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeMap();
    }, 0);
  }

  private checkAuthStatus() {
    this.authService.isAuthenticated().subscribe(isAuth => {
      this.isUserAuthenticated = isAuth;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  private initializeMap() {
    if (this.mapInitialized) {
      return;
    }

    // Check if Leaflet is available
    if (typeof L === 'undefined') {
      console.error('Leaflet not loaded');
      this.loadMapFallback();
      return;
    }

    // Initialize Leaflet map centered on University of Baguio with boundary restrictions
    const campusBounds = this.getCampusBounds();
    const mapElement = document.getElementById('map');
    if (mapElement) {
      this.map = L.map('map', {
        center: [this.UB_LATITUDE, this.UB_LONGITUDE],
        zoom: 18,
        zoomControl: false,
        maxBounds: [
          campusBounds.southwest,
          campusBounds.northeast
        ],
        maxBoundsViscosity: 1.0, // Prevents panning outside bounds
        minZoom: 16,
        maxZoom: 20
      });
      
      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 20
      }).addTo(this.map);
      
      this.mapInitialized = true;
      
      // Add University of Baguio campus boundary with red line
      this.addCampusBoundary();
      
      // Add markers to map
      this.addMarkersToMap();
      
      // Add campus buildings
      this.addCampusBuildings();
      
      // Add severity legend as a map-bound control
      this.addSeverityLegend();
    }
  }

  private addCampusBoundary() {
    const campusBounds = this.getCampusBounds();
    // University of Baguio campus boundary coordinates
    const campusCoordinates = [
      [campusBounds.southwest[0], campusBounds.southwest[1]], // Southwest corner
      [campusBounds.southwest[0], campusBounds.northeast[1]], // Southeast corner
      [campusBounds.northeast[0], campusBounds.northeast[1]], // Northeast corner
      [campusBounds.northeast[0], campusBounds.southwest[1]], // Northwest corner
      [campusBounds.southwest[0], campusBounds.southwest[1]]  // Back to start
    ];

    // Add red boundary line around campus
    const campusBoundary = L.polygon(campusCoordinates, {
      color: '#dc3545', // Red color for boundary
      weight: 3,
      opacity: 1.0,
      fillColor: '#dc3545',
      fillOpacity: 0.05
    }).addTo(this.map);

    // Add boundary label
    const centerPoint = [
      (campusBounds.southwest[0] + campusBounds.northeast[0]) / 2,
      (campusBounds.southwest[1] + campusBounds.northeast[1]) / 2
    ];
    
    L.marker(centerPoint, {
      icon: L.divIcon({
        className: 'boundary-label',
        html: '<div style="background: rgba(220, 53, 69, 0.9); color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; white-space: nowrap;">UNIVERSITY OF BAGUIO CAMPUS</div>',
        iconSize: [200, 20],
        iconAnchor: [100, 10]
      })
    }).addTo(this.map);
  }

  private addCampusBuildings() {
    // Important University of Baguio campus buildings
    const buildings = [
      {
        name: 'Main Building',
        position: [16.4166, 120.5931],
        icon: 'blue'
      },
      {
        name: 'University Library',
        position: [16.4170, 120.5935],
        icon: 'green'
      },
      {
        name: 'Gymnasium',
        position: [16.4160, 120.5935],
        icon: 'orange'
      },
      {
        name: 'Administration Building',
        position: [16.4175, 120.5925],
        icon: 'purple'
      },
      {
        name: 'Science Building',
        position: [16.4155, 120.5928],
        icon: 'red'
      }
    ];

    buildings.forEach(building => {
      const marker = L.marker(building.position, {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: ${building.icon}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).addTo(this.map);

      marker.bindPopup(`<div style="padding: 10px;"><h4>${building.name}</h4><p>University of Baguio</p></div>`);
    });
  }

  private addSeverityLegend() {
    const legendControl = L.control({ position: 'topleft' });
    legendControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'map-severity-legend');
      div.innerHTML = `
        <div style="
          background: white;
          padding: 12px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          min-width: 120px;
          max-width: 150px;
        ">
          <h4 style="margin: 0 0 8px 0; font-size: 0.85em; color: #333; white-space: nowrap;">Severity Legend</h4>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-size: 0.8em;">
            <span style="width: 12px; height: 12px; border-radius: 50%; background: #dc3545; display: inline-block;"></span>
            <span>Critical</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-size: 0.8em;">
            <span style="width: 12px; height: 12px; border-radius: 50%; background: #fd7e14; display: inline-block;"></span>
            <span>High</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-size: 0.8em;">
            <span style="width: 12px; height: 12px; border-radius: 50%; background: #ffc107; display: inline-block;"></span>
            <span>Medium</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; font-size: 0.8em;">
            <span style="width: 12px; height: 12px; border-radius: 50%; background: #28a745; display: inline-block;"></span>
            <span>Low</span>
          </div>
        </div>
      `;
      return div;
    };
    legendControl.addTo(this.map);
  }

  private loadMarkers() {
    this.incidentService.getMapMarkers().subscribe(markers => {
      this.markers = markers;
      if (this.map) {
        this.addMarkersToMap();
      }
    });
  }

  private addMarkersToMap() {
    if (!this.map || !this.markers) return;

    // Clear existing incident markers
    this.incidentMarkers.forEach(marker => this.map.removeLayer(marker));
    this.incidentMarkers = [];

    // Add new incident markers
    this.markers.forEach(marker => {
      const mapMarker = L.marker([marker.position.lat, marker.position.lng], {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: ${this.getSeverityColor(marker.incident.severity)}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(this.map);

      // Create popup for incident details
      const popupContent = this.createIncidentPopupContent(marker.incident);
      mapMarker.bindPopup(popupContent);

      // Add click listener
      mapMarker.on('click', () => {
        this.selectIncident(marker.incident);
      });

      this.incidentMarkers.push(mapMarker);
    });
  }

  private createIncidentPopupContent(incident: Incident): string {
    const severityColor = this.getSeverityColor(incident.severity);
    const statusColor = this.getStatusColor(incident.status);
    
    return `
      <div style="padding: 12px; max-width: 250px;">
        <h4 style="margin: 0 0 8px 0; color: #333;">${incident.title}</h4>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <span style="background: ${severityColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">
            ${incident.severity.toUpperCase()}
          </span>
          <span style="background: ${statusColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">
            ${incident.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px;">${incident.description}</p>
        <p style="margin: 0 0 4px 0; color: #333; font-size: 12px;">
          <strong>Location:</strong> ${incident.location.address}
        </p>
        <p style="margin: 0; color: #333; font-size: 12px;">
          <strong>Reported:</strong> ${new Date(incident.reportedAt).toLocaleDateString()}
        </p>
        <button onclick="window.location.href='/incidents/${incident.id}'" 
                style="background: #007bff; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-top: 8px;">
          View Details
        </button>
      </div>
    `;
  }

  private getMarkerIcon(severity: string): string {
    const iconColors: Record<string, string> = {
      'critical': 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      'high': 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
      'medium': 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
      'low': 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    };
    return iconColors[severity] || iconColors['low'];
  }

  selectIncident(incident: Incident) {
    this.selectedIncident = incident;
  }

  closeIncidentDetails() {
    this.selectedIncident = null;
  }

  getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      'critical': '#dc3545',
      'high': '#fd7e14',
      'medium': '#ffc107',
      'low': '#28a745'
    };
    return colors[severity] || '#6c757d';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'reported': '#007bff',
      'investigating': '#fd7e14',
      'resolved': '#28a745',
      'closed': '#6c757d',
      'false_alarm': '#6f42c1'
    };
    return colors[status] || '#6c757d';
  }

  getCriticalCount(): number {
    return this.markers.filter(m => m.incident.severity === 'critical').length;
  }

  getNewReportsCount(): number {
    return this.markers.filter(m => m.incident.status === 'reported').length;
  }

  getResolvedCount(): number {
    return this.markers.filter(m => m.incident.status === 'resolved').length;
  }

  getSeverityInitial(severity: string): string {
    return severity.charAt(0).toUpperCase();
  }

  resetMap() {
    if (this.map) {
      this.map.setView([this.UB_LATITUDE, this.UB_LONGITUDE], 17);
    }
  }

  toggleMapType() {
    if (this.map) {
      // Toggle between OpenStreetMap and different tile layers
      const currentTileLayer = this.map._layers && Object.values(this.map._layers)[0];
      if (currentTileLayer) {
        this.map.removeLayer(currentTileLayer);
        
        // Add a different tile layer (you can add more options)
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France',
          maxZoom: 19
        }).addTo(this.map);
      }
    }
  }

  // Fallback method if Google Maps is not available
  loadMapFallback() {
    console.log('Google Maps not loaded, using fallback map');
    this.mapInitialized = true;
    
    // Create a simple fallback map display
    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #e3f2fd, #bbdefb);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          font-family: Arial, sans-serif;
        ">
          <div style="
            background: rgba(255,255,255,0.9);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
          ">
            <h3 style="margin: 0 0 10px 0; color: #1976d2;">University of Baguio Campus</h3>
            <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">
              Interactive map unavailable. Showing incident locations below.
            </p>
            <div style="text-align: left;">
              <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">Campus Buildings:</h4>
              <ul style="margin: 0 0 15px 0; padding-left: 20px; color: #666; font-size: 13px;">
                <li>Main Building</li>
                <li>University Library</li>
                <li>Gymnasium</li>
                <li>Administration Building</li>
                <li>Parking Areas</li>
              </ul>
              <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">Incident Markers:</h4>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${this.markers.map(marker => `
                  <div style="
                    background: ${this.getSeverityColor(marker.incident.severity)};
                    color: white;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: bold;
                  ">
                    ${marker.incident.severity.toUpperCase()}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          <div style="position: absolute; bottom: 20px; left: 20px; right: 20px;">
            <div style="background: rgba(255,255,255,0.9); padding: 15px; border-radius: 8px;">
              <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">Recent Incidents:</h4>
              ${this.markers.slice(0, 3).map(marker => `
                <div style="margin-bottom: 8px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
                  <strong style="color: #333;">${marker.incident.title}</strong>
                  <br>
                  <span style="color: #666; font-size: 12px;">${marker.incident.location.address}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }
  }
}

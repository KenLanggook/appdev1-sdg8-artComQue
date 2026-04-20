import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User, UserRole } from '../models/incident.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private users: User[] = [];

  constructor() {
    this.initializeMockUsers();
    this.checkExistingSession();
  }

  private initializeMockUsers() {
    this.users = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@ub.edu.ph',
        password: 'admin123',
        role: UserRole.ADMIN,
        profile: {
          firstName: 'System',
          lastName: 'Administrator',
          phone: '+63-999-999-9999',
          position: 'Campus Security Director'
        },
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date(),
        isActive: true
      },
      {
        id: '2',
        username: 'security',
        email: 'security@ub.edu.ph',
        password: 'security123',
        role: UserRole.SECURITY,
        profile: {
          firstName: 'John',
          lastName: 'Smith',
          phone: '+63-888-888-8888',
          position: 'Security Officer'
        },
        createdAt: new Date('2024-01-15'),
        lastLogin: new Date(),
        isActive: true
      },
      {
        id: '3',
        username: 'student',
        email: 'student@ub.edu.ph',
        password: 'student123',
        role: UserRole.USER,
        profile: {
          firstName: 'Maria',
          lastName: 'Santos',
          phone: '+63-777-777-7777',
          studentId: '2024-12345',
          department: 'College of Engineering'
        },
        createdAt: new Date('2024-02-01'),
        lastLogin: new Date(),
        isActive: true
      }
    ];
  }

  private checkExistingSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(username: string, password: string): Observable<boolean> {
    const user = this.users.find(u => 
      u.username === username && 
      u.password === password && 
      u.isActive
    );

    if (user) {
      user.lastLogin = new Date();
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return of(true);
    }

    return of(false);
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem('currentUser');
  }

  register(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    studentId?: string;
    department?: string;
  }): Observable<boolean> {
    // Check if username or email already exists
    const existingUser = this.users.find(u => 
      u.username === userData.username || 
      u.email === userData.email
    );

    if (existingUser) {
      return of(false);
    }

    const newUser: User = {
      id: (this.users.length + 1).toString(),
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: UserRole.USER,
      profile: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        studentId: userData.studentId,
        department: userData.department
      },
      createdAt: new Date(),
      isActive: true
    };

    this.users.push(newUser);
    return of(true);
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  hasRole(role: UserRole): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.role === role : false;
  }

  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  isSecurity(): boolean {
    return this.hasRole(UserRole.SECURITY);
  }

  getAllUsers(): Observable<User[]> {
    return of(this.users.filter(u => u.isActive));
  }

  updateUserRole(userId: string, newRole: UserRole): Observable<boolean> {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.role = newRole;
      return of(true);
    }
    return of(false);
  }

  deactivateUser(userId: string): Observable<boolean> {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.isActive = false;
      return of(true);
    }
    return of(false);
  }
}

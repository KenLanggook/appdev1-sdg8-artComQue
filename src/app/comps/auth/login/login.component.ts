import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData = {
    username: '',
    password: ''
  };
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    if (!this.loginData.username || !this.loginData.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData.username, this.loginData.password).subscribe(
      (success) => {
        this.isLoading = false;
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Invalid username or password';
        }
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = 'Login failed. Please try again.';
      }
    );
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  // Demo credentials for testing
  fillDemoCredentials(role: 'admin' | 'security' | 'student') {
    switch (role) {
      case 'admin':
        this.loginData.username = 'admin';
        this.loginData.password = 'admin123';
        break;
      case 'security':
        this.loginData.username = 'security';
        this.loginData.password = 'security123';
        break;
      case 'student':
        this.loginData.username = 'student';
        this.loginData.password = 'student123';
        break;
    }
  }
}

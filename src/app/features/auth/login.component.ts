import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../core/services/auth.service';
import { MOCK_LOGIN_ACCOUNTS } from '../../core/mock/mock-auth.data';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private router      = inject(Router);
  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar    = inject(MatSnackBar);

  /** Expose to template so the HTML can toggle between mock/SSO UI */
  isMockMode = environment.mockAuth;

  isLoading    = signal(false);
  hidePassword = signal(true);

  // Demo account buttons — only rendered in mock mode
  demoUsers = MOCK_LOGIN_ACCOUNTS;

  // Form is only used in mock mode (mirrors your original login form)
  loginForm = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  ngOnInit(): void {
    // Already authenticated? Skip the login page
    if (this.authService.authenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  // ── Called by the form submit (mock mode) ──────────────────────────────────
  login(): void {
    if (this.isMockMode) {
      if (!this.loginForm.valid) return;
      this.isLoading.set(true);

      // Simulate network delay so the UI looks realistic
      setTimeout(() => {
        const { email, password } = this.loginForm.value;

        // Password check kept intentionally simple for dev testing
        if (password !== 'password123') {
          this.snackBar.open(
            'Invalid credentials. Use password123 for demo accounts.',
            'Close',
            { duration: 4000, panelClass: ['error-snackbar'] }
          );
          this.isLoading.set(false);
          return;
        }

        // authService.login() picks the mock profile for this email
        this.authService.login(email!);
        this.isLoading.set(false);
      }, 800);

    } else {
      // ── LIVE MODE: hand off to Keycloak (PKCE redirect) ──────────────────
      this.isLoading.set(true);
      this.authService.login(); // page will redirect away — no need to reset loader
    }
  }

  // Fills the form with a demo account email — mock mode only
  fillDemoCredentials(email: string): void {
    this.loginForm.patchValue({ email, password: 'password123' });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }
}

// import { Component, inject, signal } from '@angular/core';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
// import { Router } from '@angular/router';
// import { AuthService } from '../../core/services/auth.service';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [
//     ReactiveFormsModule,
//     MatCardModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatIconModule,
//     MatButtonModule,
//     MatCheckboxModule,
//     MatDividerModule,
//     MatProgressSpinnerModule,
//     MatSnackBarModule,
//   ],
//   templateUrl: './login.component.html',
//   styleUrl: './login.component.scss',
// })
// export class LoginComponent {
//   private router = inject(Router);
//   private fb = inject(FormBuilder);
//   private authService = inject(AuthService);
//   private snackBar = inject(MatSnackBar);

//   isLoading = signal(false);
//   hidePassword = signal(true);

//   loginForm = this.fb.group({
//     email: ['', [Validators.required, Validators.email]],
//     password: ['', [Validators.required, Validators.minLength(6)]],
//     rememberMe: [false],
//   });

//   demoUsers = [
//     { email: 'admin@company.com', role: 'Admin' },
//     { email: 'editor@company.com', role: 'Editor' },
//     { email: 'viewer@company.com', role: 'Viewer' },
//   ];

//   login() {
//     if (this.loginForm.valid) {
//       this.isLoading.set(true);

//       setTimeout(() => {
//         const { email, password, rememberMe } = this.loginForm.value;
//         const success = this.authService.login(email!, password!, rememberMe!);

//         if (!success) {
//           this.snackBar.open('Invalid credentials. Use password123 for demo accounts.', 'Close', {
//             duration: 4000,
//             panelClass: ['error-snackbar'],
//           });
//         }

//         this.isLoading.set(false);
//       }, 1000);
//     }
//   }

//   fillDemoCredentials(email: string) {
//     this.loginForm.patchValue({
//       email,
//       password: 'password123',
//     });
//   }

//   togglePasswordVisibility() {
//     this.hidePassword.set(!this.hidePassword());
//   }
// }

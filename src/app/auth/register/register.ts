import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { fadeInOut, slideStep } from '../auth-animations';
import { StudentService } from '../../core/services/student.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  animations: [fadeInOut, slideStep]
})
export class Register {
  registerForm: FormGroup;
  currentStep: number = 1;
  totalSteps: number = 3;
  apiError = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      // Étape 1: Informations personnelles
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      level: ['', [Validators.required]],
      // Étape 2: Email
      email: ['', [Validators.required, Validators.email]],
      // Étape 3: Mot de passe
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  getStepFields(step: number): string[] {
    switch (step) {
      case 1:
        return ['firstName', 'lastName', 'level'];
      case 2:
        return ['email'];
      case 3:
        return ['password', 'confirmPassword'];
      default:
        return [];
    }
  }

  isStepValid(step: number): boolean {
    const fields = this.getStepFields(step);
    return fields.every(field => {
      const control = this.registerForm.get(field);
      return control ? control.valid : false;
    });
  }

  nextStep(): void {
    if (this.isStepValid(this.currentStep) && this.currentStep < this.totalSteps) {
      // Marquer les champs de l'étape actuelle comme touchés
      this.getStepFields(this.currentStep).forEach(field => {
        this.registerForm.get(field)?.markAsTouched();
      });

      this.currentStep++;
    } else {
      // Marquer tous les champs de l'étape comme touchés pour afficher les erreurs
      this.getStepFields(this.currentStep).forEach(field => {
        this.registerForm.get(field)?.markAsTouched();
      });
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.getStepFields(this.currentStep).forEach(field => {
        this.registerForm.get(field)?.markAsTouched();
      });
      return;
    }

    this.apiError = '';
    this.successMessage = '';
    const formValues = this.registerForm.value;

    const payload = {
      fullName: formValues.firstName + ' ' + formValues.lastName,
      email: formValues.email,
      password: formValues.password,
      level: formValues.level
    };

    this.studentService.createStudent(payload).subscribe({
      next: (res) => {
        this.successMessage = 'Account created successfully! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('Registration API Error:', err);
        // Ensure we extract a meaningful error message
        this.apiError = err.error?.message || err.message || 'Registration failed. Please try again later.';
      }
    });
  }
}

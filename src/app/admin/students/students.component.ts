import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../components/sidebar/sidebar';
import { StudentService } from '../../core/services/student.service';
import { Student } from '../../models/student.model';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-students',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
    templateUrl: './students.component.html',
    styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit {
    private readonly studentService = inject(StudentService);
    private readonly router = inject(Router);
    private readonly cdr = inject(ChangeDetectorRef);

    students: Student[] = [];
    filteredStudents: Student[] = [];
    searchQuery = '';

    loading = false;
    loadError = '';
    successMessage = '';
    errorMessage = '';

    // Pagination state
    currentPage = 0;
    pageSize = 5;
    totalElements = 0;
    totalPages = 0;
    isLastPage = false;

    showAddModal = false;
    isEditMode = false;
    editingId: number | null = null;
    saving = false;

    form = { fullName: '', email: '', password: '', level: '' };

    ngOnInit(): void {
        if (!localStorage.getItem('token')) {
            this.router.navigate(['/login']);
            return;
        }
        this.loadStudentsPaged();
    }

    loadStudents(): void {
        this.loading = true;
        this.loadError = '';
        this.cdr.detectChanges();

        this.studentService.getStudents().pipe(
            finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (data: Student[]) => {
                this.students = data ?? [];
                this.applyFilter();
            },
            error: (err: any) => {
                console.error('Error fetching students', err);
                if (err?.status === 401) {
                    this.loadError = 'Session expired. Please log in again.';
                } else if (err?.status === 0) {
                    this.loadError = 'Cannot reach the server. Make sure the backend is running.';
                } else {
                    this.loadError = err?.error?.message || 'Failed to load students.';
                }
            }
        });
    }

    loadStudentsPaged(page: number = 0): void {
        this.loading = true;
        this.loadError = '';
        this.cdr.detectChanges();

        this.studentService.getStudentsPaged(page, this.pageSize).pipe(
            finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (response) => {
                this.students = response.content;
                this.currentPage = response.page;
                this.totalElements = response.totalElements;
                this.totalPages = response.totalPages;
                this.isLastPage = response.last;
                this.applyFilter();
            },
            error: (err: any) => {
                console.error('Error fetching students', err);
                if (err?.status === 401) {
                    this.loadError = 'Session expired. Please log in again.';
                } else if (err?.status === 0) {
                    this.loadError = 'Cannot reach the server. Make sure the backend is running.';
                } else {
                    this.loadError = err?.error?.message || 'Failed to load students.';
                }
            }
        });
    }

    nextPage(): void {
        if (!this.isLastPage) this.loadStudentsPaged(this.currentPage + 1);
    }

    previousPage(): void {
        if (this.currentPage > 0) this.loadStudentsPaged(this.currentPage - 1);
    }

    goToPage(page: number): void {
        if (page >= 0 && page < this.totalPages) this.loadStudentsPaged(page);
    }

    applyFilter(): void {
        const q = this.searchQuery.toLowerCase().trim();
        this.filteredStudents = q
            ? this.students.filter(s =>
                s.fullName.toLowerCase().includes(q) ||
                s.email.toLowerCase().includes(q) ||
                s.level.toLowerCase().includes(q))
            : [...this.students];
        this.cdr.detectChanges();
    }

    getInitials(name: string): string {
        return name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2);
    }

    getAvatarColor(name: string): string {
        const colors = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
        return colors[name.charCodeAt(0) % colors.length];
    }

    getLevelClass(level: string): string {
        const map: Record<string, string> = {
            '1st year': 'level-1', '2nd year': 'level-2',
            '3rd year': 'level-3', '4th year': 'level-4', '5th year': 'level-5'
        };
        return map[level] ?? 'level-1';
    }

    openAddModal(): void {
        this.isEditMode = false;
        this.editingId = null;
        this.form = { fullName: '', email: '', password: '', level: '' };
        this.errorMessage = '';
        this.showAddModal = true;
    }

    openEditModal(student: Student): void {
        this.isEditMode = true;
        this.editingId = student.id ?? null;
        this.form = { fullName: student.fullName, email: student.email, password: '', level: student.level };
        this.errorMessage = '';
        this.showAddModal = true;
    }

    closeModal(): void {
        this.showAddModal = false;
        this.saving = false;
        this.errorMessage = '';
    }

    submit(): void {
        this.errorMessage = '';
        this.saving = true;

        if (this.isEditMode && this.editingId !== null) {
            const payload: any = { fullName: this.form.fullName, email: this.form.email, level: this.form.level };
            if (this.form.password) payload.password = this.form.password;

            this.studentService.updateStudent(this.editingId, payload).subscribe({
                next: () => { this.closeModal(); this.showSuccess('Student updated.'); this.loadStudentsPaged(this.currentPage); },
                error: (err: any) => { this.saving = false; this.errorMessage = err?.error?.message || 'Error updating.'; }
            });
        } else {
            this.studentService.createStudent(this.form).subscribe({
                next: () => { this.closeModal(); this.showSuccess('Student added successfully.'); this.loadStudentsPaged(0); },
                error: (err: any) => {
                    this.saving = false;
                    if (err?.status === 409) {
                        this.errorMessage = 'This email is already registered.';
                    } else if (err?.status === 400) {
                        this.errorMessage = err?.error?.message || 'Invalid data. Please check the form.';
                    } else {
                        this.errorMessage = 'An error occurred. Please try again.';
                    }
                    this.cdr.detectChanges();
                }
            });
        }
    }

    deleteStudent(id: number | undefined): void {
        if (id === undefined || !confirm('Delete this student?')) return;
        this.studentService.deleteStudent(id).subscribe({
            next: () => { this.showSuccess('Student deleted.'); this.loadStudentsPaged(this.currentPage); },
            error: () => { this.loadError = 'Failed to delete student.'; }
        });
    }

    trackById(_: number, s: Student): number | undefined { return s.id; }

    private showSuccess(msg: string): void {
        this.successMessage = msg;
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3500);
    }
}

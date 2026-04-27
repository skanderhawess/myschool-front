import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../core/services/course.service';
import { Course } from '../../models/course.model';
import { SidebarComponent } from '../components/sidebar/sidebar';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-courses',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
    templateUrl: './courses.component.html',
    styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {
    private courseService = inject(CourseService);
    private cdr = inject(ChangeDetectorRef);

    courses: Course[] = [];
    loading = false;
    loadError = '';
    saving = false;
    successMsg = '';
    successTimer: any;

    // Pagination state
    currentPage = 0;
    pageSize = 5;
    totalElements = 0;
    totalPages = 0;
    isLastPage = false;

    showModal = false;
    isEdit = false;
    selectedCourseId?: number;
    errorMessage = '';

    form: { title: string; dateTime: string } = { title: '', dateTime: '' };

    ngOnInit(): void {
        this.loadCoursesPaged();
    }

    loadCourses(): void {
        this.loading = true;
        this.loadError = '';
        this.courseService.getAll().pipe(
            finalize(() => { this.loading = false; this.cdr.detectChanges(); })
        ).subscribe({
            next: (data: Course[]) => {
                this.courses = data;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loadError = 'Failed to load courses. Check server connection.';
                this.cdr.detectChanges();
            }
        });
    }

    loadCoursesPaged(page: number = 0): void {
        this.loading = true;
        this.loadError = '';
        this.cdr.detectChanges();

        this.courseService.getCoursesPaged(page, this.pageSize).pipe(
            finalize(() => { this.loading = false; this.cdr.detectChanges(); })
        ).subscribe({
            next: (response) => {
                this.courses = response.content;
                this.currentPage = response.page;
                this.totalElements = response.totalElements;
                this.totalPages = response.totalPages;
                this.isLastPage = response.last;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loadError = 'Failed to load courses. Check server connection.';
                this.cdr.detectChanges();
            }
        });
    }

    nextPage(): void {
        if (!this.isLastPage) this.loadCoursesPaged(this.currentPage + 1);
    }

    previousPage(): void {
        if (this.currentPage > 0) this.loadCoursesPaged(this.currentPage - 1);
    }

    goToPage(page: number): void {
        if (page >= 0 && page < this.totalPages) this.loadCoursesPaged(page);
    }

    openAdd(): void {
        this.form = { title: '', dateTime: '' };
        this.isEdit = false;
        this.selectedCourseId = undefined;
        this.errorMessage = '';
        this.showModal = true;
        this.cdr.detectChanges();
    }

    openEdit(course: Course): void {
        this.form = {
            title: course.title,
            dateTime: course.dateTime ? this.toDatetimeLocal(course.dateTime) : ''
        };
        this.isEdit = true;
        this.selectedCourseId = course.id;
        this.errorMessage = '';
        this.showModal = true;
        this.cdr.detectChanges();
    }

    closeModal(): void {
        this.showModal = false;
        this.errorMessage = '';
        this.cdr.detectChanges();
    }

    isFormValid(): boolean {
        return !!(this.form.title && this.form.title.trim().length >= 2);
    }

    submit(): void {
        if (!this.isFormValid() || this.saving) return;
        this.saving = true;
        this.errorMessage = '';
        this.cdr.detectChanges();

        const payload: any = { title: this.form.title.trim() };
        if (this.form.dateTime) payload.dateTime = this.form.dateTime;

        const call$ = this.isEdit
            ? this.courseService.update(this.selectedCourseId!, payload)
            : this.courseService.create(payload);

        call$.pipe(
            finalize(() => { this.saving = false; this.cdr.detectChanges(); })
        ).subscribe({
            next: () => {
                const targetPage = this.isEdit ? this.currentPage : 0;
                this.closeModal();
                this.loadCoursesPaged(targetPage);
                this.showSuccess(this.isEdit ? 'Course updated successfully!' : 'Course added successfully!');
            },
            error: (err: any) => {
                this.errorMessage = err?.error?.message || 'An error occurred. Please try again.';
                this.cdr.detectChanges();
            }
        });
    }

    deleteCourse(id: number | undefined): void {
        if (id === undefined || !confirm('Delete this course? This action cannot be undone.')) return;
        this.courseService.delete(id).pipe(
            finalize(() => this.cdr.detectChanges())
        ).subscribe({
            next: () => {
                this.loadCoursesPaged(this.currentPage);
                this.showSuccess('Course deleted.');
            },
            error: () => {
                this.loadError = 'Failed to delete course.';
                this.cdr.detectChanges();
            }
        });
    }

    private showSuccess(msg: string): void {
        this.successMsg = msg;
        this.cdr.detectChanges();
        clearTimeout(this.successTimer);
        this.successTimer = setTimeout(() => {
            this.successMsg = '';
            this.cdr.detectChanges();
        }, 3500);
    }

    private toDatetimeLocal(value: string): string {
        if (!value) return '';
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
        const match = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
        return match ? match[1] : value;
    }
}

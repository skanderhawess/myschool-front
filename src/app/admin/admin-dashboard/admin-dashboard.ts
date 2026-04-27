import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../components/sidebar/sidebar';
import { CourseService } from '../../core/services/course.service';
import { StudentService } from '../../core/services/student.service';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { ReportService } from '../../core/services/report.service';
import { Course } from '../../models/course.model';
import { Student } from '../../models/student.model';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

interface EnrollmentState {
    selectedStudentId: number | null;
    loading: boolean;
    message: string;
    error: boolean;
}

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DatePipe,
        SidebarComponent
    ],
    templateUrl: './admin-dashboard.html',
    styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboardComponent implements OnInit {
    private courseService = inject(CourseService);
    private studentService = inject(StudentService);
    private enrollmentService = inject(EnrollmentService);
    private reportService = inject(ReportService);
    private cdr = inject(ChangeDetectorRef);

    // --- Dashboard stats ---
    today = new Date();
    totalStudents = 0;
    totalCourses = 0;
    totalEnrollments = 0;
    loadingStats = false;

    // --- Enrollment section ---
    apiCourses: Course[] = [];
    students: Student[] = [];
    loadingCourses = false;
    loadError: string | null = null;

    enrollmentState: Record<number, EnrollmentState> = {};

    ngOnInit(): void {
        this.loadStats();
        this.loadData();
    }

    loadStats(): void {
        this.loadingStats = true;
        this.reportService.getStats()
            .pipe(finalize(() => {
                this.loadingStats = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: (stats) => {
                    this.totalStudents = stats.totalStudents;
                    this.totalCourses = stats.totalCourses;
                    this.totalEnrollments = stats.totalEnrollments;
                },
                error: (err) => console.error('Stats error', err)
            });
    }

    loadData(): void {
        this.loadingCourses = true;
        this.loadError = null;

        forkJoin({
            courses: this.courseService.getAll().pipe(
                catchError(err => {
                    console.error('Courses error:', err);
                    return of([] as Course[]);
                })
            ),
            students: this.studentService.getStudents().pipe(
                catchError(err => {
                    console.error('Students error:', err);
                    return of([] as Student[]);
                })
            )
        }).pipe(
            finalize(() => {
                this.loadingCourses = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: ({ courses, students }) => {
                this.apiCourses = courses;
                this.students = students;

                this.apiCourses.forEach(c => {
                    if (!this.enrollmentState[c.id]) {
                        this.enrollmentState[c.id] = {
                            selectedStudentId: null,
                            loading: false,
                            message: '',
                            error: false
                        };
                    }
                });
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Fatal error loading data:', err);
                this.loadError = 'Unable to connect to the server. Check that the backend is running.';
                this.cdr.detectChanges();
            }
        });
    }

    getEnrollmentState(courseId: number): EnrollmentState {
        if (!this.enrollmentState[courseId]) {
            this.enrollmentState[courseId] = {
                selectedStudentId: null,
                loading: false,
                message: '',
                error: false
            };
        }
        return this.enrollmentState[courseId];
    }

    enrollStudent(courseId: number): void {
        const state = this.getEnrollmentState(courseId);
        if (state.selectedStudentId == null) return;

        const selectedStudentId = Number(state.selectedStudentId);
        state.loading = true;
        state.message = '';
        state.error = false;
        this.cdr.detectChanges();

        this.enrollmentService.enroll({ studentId: selectedStudentId, courseId }).subscribe({
            next: () => {
                state.loading = false;
                state.message = 'Enrolled successfully!';
                state.error = false;
                state.selectedStudentId = null;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                state.loading = false;
                state.error = true;
                if (err?.status === 409) {
                    state.message = 'This student is already enrolled in this course.';
                } else {
                    state.message = err?.error?.message || 'Enrollment failed. Try again.';
                }
                this.cdr.detectChanges();
            }
        });
    }
}

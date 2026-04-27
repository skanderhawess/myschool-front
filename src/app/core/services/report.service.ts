import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { USER_SERVICE_URL } from '../api/api.config';

export interface DashboardStats {
    totalStudents: number;
    totalCourses: number;
    totalEnrollments: number;
    averageEnrollmentsPerCourse: number;
    mostPopularCourseId: number;
    mostPopularCourseTitle: string;
    mostPopularCourseEnrollments: number;
}

export interface CourseStats {
    courseId: number;
    courseTitle: string;
    enrolledCount: number;
    fillRate: number;
}

export interface StudentReport {
    studentId: number;
    fullName: string;
    email: string;
    level: string;
    enrolledCourses: number;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
    private http = inject(HttpClient);
    private base = `${USER_SERVICE_URL}/reports`;

    getStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.base}/stats`);
    }

    getCourseStats(): Observable<CourseStats[]> {
        return this.http.get<CourseStats[]>(`${this.base}/courses`);
    }

    getStudentReport(): Observable<StudentReport[]> {
        return this.http.get<StudentReport[]>(`${this.base}/students`);
    }

    downloadExcel(): Observable<Blob> {
        return this.http.get(`${this.base}/export/excel`, { responseType: 'blob' });
    }

    downloadPdf(): Observable<Blob> {
        return this.http.get(`${this.base}/export/pdf`, { responseType: 'blob' });
    }
}

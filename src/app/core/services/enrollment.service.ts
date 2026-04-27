import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { USER_SERVICE_URL } from '../api/api.config';
import { EnrollmentRequest, EnrollmentResponse } from '../../models/enrollment.model';

@Injectable({
    providedIn: 'root'
})
export class EnrollmentService {
    private http = inject(HttpClient);
    private apiUrl = `${USER_SERVICE_URL}/enrollments`;

    enroll(request: EnrollmentRequest): Observable<EnrollmentResponse> {
        return this.http.post<EnrollmentResponse>(this.apiUrl, request);
    }

    getAll(): Observable<EnrollmentResponse[]> {
        return this.http.get<EnrollmentResponse[]>(this.apiUrl);
    }

    getByStudentId(studentId: number): Observable<EnrollmentResponse[]> {
        return this.http.get<EnrollmentResponse[]>(`${this.apiUrl}/student/${studentId}`);
    }
}

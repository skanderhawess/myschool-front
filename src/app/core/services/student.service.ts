import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../../models/student.model';
import { USER_SERVICE_URL } from '../api/api.config';

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class StudentService {
    private readonly http = inject(HttpClient);
    private apiUrl = `${USER_SERVICE_URL}/students`;

    getStudents(): Observable<Student[]> {
        return this.http.get<Student[]>(this.apiUrl);
    }

    getStudentsPaged(page: number = 0, size: number = 10, sortBy: string = 'id'): Observable<PageResponse<Student>> {
        return this.http.get<PageResponse<Student>>(
            `${this.apiUrl}/paged?page=${page}&size=${size}&sortBy=${sortBy}`
        );
    }

    getStudentById(id: number): Observable<Student> {
        return this.http.get<Student>(`${this.apiUrl}/${id}`);
    }

    createStudent(payload: any): Observable<Student> {
        return this.http.post<Student>(this.apiUrl, payload);
    }

    updateStudent(id: number, payload: any): Observable<Student> {
        return this.http.put<Student>(`${this.apiUrl}/${id}`, payload);
    }

    deleteStudent(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../../models/course.model';
import { COURSE_SERVICE_URL } from '../api/api.config';

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
export class CourseService {
    private readonly http = inject(HttpClient);
    private apiUrl = `${COURSE_SERVICE_URL}/courses`;

    getAll(): Observable<Course[]> {
        return this.http.get<Course[]>(this.apiUrl);
    }

    getCoursesPaged(page: number = 0, size: number = 5): Observable<PageResponse<Course>> {
        return this.http.get<PageResponse<Course>>(
            `${this.apiUrl}/paged?page=${page}&size=${size}&sortBy=id`
        );
    }

    getById(id: number): Observable<Course> {
        return this.http.get<Course>(`${this.apiUrl}/${id}`);
    }

    create(payload: any): Observable<Course> {
        return this.http.post<Course>(this.apiUrl, payload);
    }

    update(id: number, payload: any): Observable<Course> {
        return this.http.put<Course>(`${this.apiUrl}/${id}`, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
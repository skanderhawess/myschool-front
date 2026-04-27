

export interface EnrollmentRequest {
    studentId: number;
    courseId: number;
}

export interface EnrollmentResponse {
    id: number;
    studentId: number;
    courseId: number;
}
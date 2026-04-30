import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../components/sidebar/sidebar';
import { ReportService, DashboardStats, CourseStats, StudentReport } from '../../core/services/report.service';
import { finalize } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, SidebarComponent],
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
    private readonly reportService = inject(ReportService);
    private readonly cdr = inject(ChangeDetectorRef);

    stats: DashboardStats | null = null;
    courseStats: CourseStats[] = [];
    studentReport: StudentReport[] = [];

    loading = false;
    loadError = '';
    exportingPdf = false;
    exportingExcel = false;

    ngOnInit(): void {
        this.loadAll();
    }

    loadAll(): void {
        this.loading = true;
        this.loadError = '';

        forkJoin({
            stats:   this.reportService.getStats().pipe(catchError(() => of(null))),
            courses: this.reportService.getCourseStats().pipe(catchError(() => of([]))),
            students: this.reportService.getStudentReport().pipe(catchError(() => of([])))
        }).pipe(
            finalize(() => { this.loading = false; this.cdr.detectChanges(); })
        ).subscribe({
            next: ({ stats, courses, students }) => {
                this.stats = stats as DashboardStats | null;
                this.courseStats = courses as CourseStats[];
                this.studentReport = students as StudentReport[];
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.loadError = 'Failed to load reports. Check the server connection.';
                console.error(err);
                this.cdr.detectChanges();
            }
        });
    }

    /** Calcule la largeur de la barre de progression (max = plus grand enrolled) */
    getBarWidth(enrolled: number): string {
        if (!this.courseStats.length) return '0%';
        const max = Math.max(...this.courseStats.map(c => c.enrolledCount));
        return max === 0 ? '0%' : Math.round((enrolled / max) * 100) + '%';
    }

    getLevelColor(level: string): string {
        const map: Record<string, string> = {
            '1st year': '#ede9fe', '2nd year': '#dbeafe',
            '3rd year': '#d1fae5', '4th year': '#fef3c7', '5th year': '#fee2e2'
        };
        return map[level] ?? '#f3f4f6';
    }

    getLevelTextColor(level: string): string {
        const map: Record<string, string> = {
            '1st year': '#5b21b6', '2nd year': '#1e40af',
            '3rd year': '#065f46', '4th year': '#92400e', '5th year': '#991b1b'
        };
        return map[level] ?? '#374151';
    }

    downloadExcel(): void {
        this.exportingExcel = true;
        this.reportService.downloadExcel().pipe(
            finalize(() => { this.exportingExcel = false; this.cdr.detectChanges(); })
        ).subscribe({
            next: (blob) => this.triggerDownload(blob, 'students_report.xlsx'),
            error: () => alert('Excel export failed.')
        });
    }

    downloadPdf(): void {
        this.exportingPdf = true;
        this.reportService.downloadPdf().pipe(
            finalize(() => { this.exportingPdf = false; this.cdr.detectChanges(); })
        ).subscribe({
            next: (blob) => this.triggerDownload(blob, 'myschool_report.pdf'),
            error: () => alert('PDF export failed.')
        });
    }

    private triggerDownload(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}

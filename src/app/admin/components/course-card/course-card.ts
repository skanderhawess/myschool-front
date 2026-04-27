import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardCourse } from '../../admin-dashboard/admin-dashboard.data';

@Component({
    selector: 'app-course-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './course-card.html',
    styleUrls: ['./course-card.scss']
})
export class CourseCardComponent {
    @Input() course!: DashboardCourse;
}
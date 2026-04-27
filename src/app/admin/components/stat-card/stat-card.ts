import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceCard } from '../../admin-dashboard/admin-dashboard.data';

@Component({
    selector: 'app-stat-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './stat-card.html',
    styleUrls: ['./stat-card.scss']
})
export class StatCardComponent {
    @Input() data!: FinanceCard;
}

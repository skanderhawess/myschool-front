import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SIDEBAR_LINKS, SidebarLink } from '../../admin-dashboard/admin-dashboard.data';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sidebar.html',
    styleUrls: ['./sidebar.scss']
})
export class SidebarComponent {
    links: SidebarLink[] = SIDEBAR_LINKS;
}

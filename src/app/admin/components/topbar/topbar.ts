import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './topbar.html',
    styleUrls: ['./topbar.scss']
})
export class TopbarComponent implements OnInit {
    userName = 'Admin';
    userInitial = 'A';

    ngOnInit(): void {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const email = payload.sub || '';
                const name = email.split('@')[0];
                this.userName = name.charAt(0).toUpperCase() + name.slice(1);
                this.userInitial = name.charAt(0).toUpperCase();
            } catch {
                this.userName = 'Admin';
                this.userInitial = 'A';
            }
        }
    }
}

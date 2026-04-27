import { trigger, transition, style, animate } from '@angular/animations';

export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('400ms ease-in-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('300ms ease-in-out', style({ opacity: 0, transform: 'translateY(-20px)' }))
  ])
]);

export const slideInOut = trigger('slideInOut', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(30px)' }),
    animate('400ms ease-in-out', style({ opacity: 1, transform: 'translateX(0)' }))
  ]),
  transition(':leave', [
    animate('300ms ease-in-out', style({ opacity: 0, transform: 'translateX(-30px)' }))
  ])
]);

export const slideStep = trigger('slideStep', [
  transition('* => *', [
    style({ opacity: 0, transform: 'translateX(20px)' }),
    animate('300ms ease-in-out', style({ opacity: 1, transform: 'translateX(0)' }))
  ])
]);

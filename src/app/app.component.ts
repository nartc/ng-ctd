import { Component } from '@angular/core';
import { NgtCanvas } from 'angular-three';
import { Scene } from './scene.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [NgtCanvas],
    template: `
        <ngt-canvas [sceneGraph]="scene" />
    `,
})
export class AppComponent {
    readonly scene = Scene;
}

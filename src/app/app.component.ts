import { Component } from '@angular/core';
import { NgtCanvas } from 'angular-three';
import { Scene } from './scene/scene.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [NgtCanvas],
    template: `
        <ngt-canvas [sceneGraph]="scene" [camera]="{ position: [1, 1.5, 5], fov: 100 }" [shadows]="true" />
    `,
})
export class AppComponent {
    readonly scene = Scene;
}

import { NgFor, NgIf } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { NgtArgs, NgtPush, NgtRxStore, checkNeedsUpdate, extend, makeObjectGraph } from 'angular-three';
import { NgtsText } from 'angular-three-soba/abstractions';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { injectNgtsGLTFLoader, injectNgtsTextureLoader } from 'angular-three-soba/loaders';
import { injectNgtsAnimations } from 'angular-three-soba/misc';
import { animationFrameScheduler, combineLatest, map, observeOn, switchMap, tap } from 'rxjs';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { users } from './github-users';

extend(THREE);

@Component({
    selector: 'app-stacy',
    standalone: true,
    templateUrl: 'stacy.component.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [NgIf, NgtArgs, NgtPush, NgtsText],
})
export class Stacy extends NgtRxStore {
    @Input() set pose(pose: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8) {
        this.set({ pose });
    }
    @Input() set avatarUrl(avatarUrl: string) {
        this.set({ avatarUrl });
    }

    @Input() position = [0, 0, 0];
    @Input() login = '';

    readonly Math = Math;
    readonly DoubleSide = THREE.DoubleSide;

    readonly texture$ = injectNgtsTextureLoader('assets/stacy.jpg').pipe(
        tap((texture) => {
            texture.flipY = false;
            checkNeedsUpdate(texture);
        })
    );

    readonly avatarTexture$ = injectNgtsTextureLoader(this.select('avatarUrl'));

    private readonly clone$ = injectNgtsGLTFLoader('assets/stacy.glb').pipe(
        map((gltf) => ({ scene: SkeletonUtils.clone(gltf.scene), animations: gltf.animations }))
    );

    readonly animations = injectNgtsAnimations(this.clone$.pipe(map((clone) => clone.animations)));
    readonly nodes$ = this.clone$.pipe(map((clone) => makeObjectGraph(clone.scene).nodes));

    override initialize(): void {
        super.initialize();
        this.set({ pose: 1 });
    }

    ngOnInit() {
        this.effect(
            combineLatest([this.animations.ref.$, this.clone$])
                .pipe(switchMap(() => this.select('pose')))
                .pipe(observeOn(animationFrameScheduler)),
            (pose) => {
                const { actions, names } = this.animations;
                actions[names[pose]].reset().fadeIn(0.5).play();
                return () => {
                    actions[names[pose]].fadeOut(0.5);
                };
            }
        );
    }

    onClick() {
        this.set((s) => ({ pose: (s.pose + 1) % this.animations.names.length }));
    }
}

@Component({
    selector: 'app-scene',
    standalone: true,
    templateUrl: 'scene.component.html',
    imports: [Stacy, NgtArgs, NgIf, NgtPush, NgFor, NgtsOrbitControls],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Scene {
    readonly Math = Math;

    readonly users$ = combineLatest(
        users.map(([username, pose]) =>
            fetch(` https://api.github.com/users/${username}`)
                .then((res) => res.json())
                .then((data) => ({
                    user: data,
                    pose,
                    position: [THREE.MathUtils.randFloatSpread(5), 0, THREE.MathUtils.randFloatSpread(5)],
                }))
        )
    );
}

import { gsap } from 'gsap';
import { EventEmitter } from 'events';
import { GridItem } from './gridItem';
import { getRandomNumber } from './utils';

import 'splitting/dist/splitting.css';
import 'splitting/dist/splitting-cells.css';
import Splitting from 'splitting';

// initialize Splitting
const splitting = Splitting();


// title behind the grid
const title = document.querySelector('.content__title');
// Splitting will run on the inner spans
// get the chars
const titleChars = [...title.querySelectorAll('.char')];


export class Grid extends EventEmitter {
    constructor(el) {
        super();
        this.DOM = {el: el};

        this.gridItems = [];
        this.DOM.items = [...this.DOM.el.querySelectorAll('.grid__item')];
        this.DOM.items.forEach(item => {
            this.gridItems.push(new GridItem(item));
        });
        
        this.showItems();
        this.initEvents();
    }
    // Initial animation to scale up and fade in the items
    showItems() {
        gsap
        .timeline()
        .addLabel('start', 0)
        .set(this.DOM.items, {scale: 1.5, opacity: 0}, 0)
        .to(this.DOM.items, {
            duration: 1.2,
            ease: 'expo',
            scale: 1,
            stagger: {amount: 0.4, grid: 'auto', from: 'center'}
        }, 'start')
        .to(this.DOM.items, {
            duration: 1.2,
            ease: 'power1',
            opacity: 1,
            stagger: {amount: 0.4, grid: 'auto', from: 'center'}
        }, 'start');
    }
    initEvents() {
        for(const item of this.gridItems) {
            item.DOM.image.addEventListener('mouseenter', () => {
                item.onMouseEnter();
                this.emit('mouseEnterItem', item.title);
            });
            
            item.DOM.image.addEventListener('mouseleave', () => {
                item.onMouseLeave();
                this.emit('mouseLeaveItem');
            });
            
            item.DOM.el.addEventListener('click', ev => {
                ev.preventDefault();
                this.showContent(item);
            });

            item.preview.DOM.backCtrl.addEventListener('click', ev => {
                this.hideContent(item);
            });
        }
    }
    showContent(item) {
        if ( this.isContentOpen ) {
            return false;
        }

        this.isContentOpen = true;

        // pointer events
        this.DOM.el.classList.add('grid--inactive');

        // stop the rAF on every item
        for(const item of this.gridItems) {
           item.stopTransformAnimation();
        }
        
        gsap
        .timeline()
        .addLabel('start', 0)
        .to(this.DOM.items, {
            duration: 2,
            ease: 'expo.inOut',
            opacity: 0,
            //z: '+='+getRandomNumber(1000,5000),
            rotationX: 0,
            rotationY: 0,
            y: '-='+getRandomNumber(1000,1600),
            stagger: {amount: 0.2, grid: 'auto', from: 'top'}
        }, 'start')
        .to(titleChars, {
            duration: 1.5,
            ease: 'expo.inOut',
            opacity: 0,
            y: '-=100%',
            stagger: 0.03
        }, 'start+=0.1')
        .add(() => {
            item.preview.DOM.el.classList.add('preview__item--open');
        }, 'start+=0.1')

        // Content/preview animation
        .to(item.preview.DOM.titleChars, {
            duration: 1.5,
            ease: 'expo.inOut',
            opacity: 1,
            y: '0%',
            stagger: 0.05
        }, 'start+=0.6')
        .to([item.preview.DOM.imgWrap, item.preview.DOM.image], {
            duration: 1.5,
            ease: 'expo.inOut',
            opacity: 1,
            y: '0%',
            rotationX: 0
        }, 'start+=0.5')
        .to(item.preview.DOM.imgWrap, {
            duration: 1.5,
            ease: 'expo.inOut',
            opacity: 1
        }, 'start+=0.5')
        .to(item.preview.DOM.backCtrl, {
            duration: 1.5,
            ease: 'expo',
            startAt: {x: '20%'},
            x: '0%',
            opacity: 1
        }, 'start+=1.5')
        .to(item.preview.DOM.content, {
            duration: 1.5,
            ease: 'expo',
            startAt: {y: '20%'},
            y: '0%',
            opacity: 1
        }, 'start+=1.5');
    }
    hideContent(item) {
        if ( !this.isContentOpen ) {
            return false;
        }
        this.isContentOpen = false;

        gsap
        .timeline({
            onComplete: () => {
                item.preview.DOM.el.classList.remove('preview__item--open');
                // pointer events
                this.DOM.el.classList.remove('grid--inactive');
            }
        })
        .addLabel('start', 0)
        // Content/preview animation
        .to(item.preview.DOM.titleChars, {
            duration: 1.5,
            ease: 'expo.inOut',
            opacity: 0,
            y: '100%',
            stagger: -0.04
        }, 'start')
        .to(item.preview.DOM.imgWrap, {
            duration: 1.5,
            ease: 'expo.inOut',
            y: '100%',
            rotationX: -20
        }, 'start')
        .to(item.preview.DOM.image, {
            duration: 1.5,
            ease: 'expo.inOut',
            y: '-100%'
        }, 'start')
        .to(item.preview.DOM.backCtrl, {
            duration: 1.5,
            ease: 'expo.inOut',
            x: '20%',
            opacity: 0
        }, 'start')
        .to(item.preview.DOM.content, {
            duration: 1.5,
            ease: 'expo.inOut',
            y: '50%',
            opacity: 0
        }, 'start')

        .to(titleChars, {
            duration: 1,
            ease: 'expo.inOut',
            opacity: 1,
            y: '0%',
            stagger: -0.03
        }, 'start+=0.4')
        .add(() => {
            // start the rAF on every item
            for(const item of this.gridItems) {
                item.translationVals.y = item.rotationVals.y = item.rotationVals.x = 0;
                item.loopTransformAnimation();
            }
        }, 'start+=0.3')
        .to(this.DOM.items, {
            duration: 1,
            ease: 'expo',
            opacity: 1,
            startAt: {scale: 0.2},
            scale: 1,
            stagger: {amount: 0.2, grid: 'auto', from: 'center'}
        }, 'start+=1')
    }
}
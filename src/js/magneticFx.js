import gsap from 'gsap';
import { lerp, getMousePos, calcWinsize, getTranslateValues } from './utils';

// Calculate the viewport size
let winsize = calcWinsize();
window.addEventListener('resize', () => winsize = calcWinsize());

// Track the mouse position
let mousepos = {x: 0, y: 0};
window.addEventListener('mousemove', ev => mousepos = getMousePos(ev));

export class MagneticFx {
    constructor(el) {
        // DOM elements
        this.DOM = {el: el};
        // amounts the element will translated
        this.renderedStyles = {
            tx: {previous: 0, current: 0, amt: 0.04},
            ty: {previous: 0, current: 0, amt: 0.04}
        };
        // calculate size/position
        this.calculateSizePosition();
        // init events
        this.initEvents();
    }
    calculateSizePosition() {
        // current scroll
        this.scrollVal = {x: window.scrollX, y: window.scrollY};
        // size/position
        this.rect = this.DOM.el.getBoundingClientRect();
    }
    initEvents() {
        window.addEventListener('resize', () => this.calculateSizePosition());

        this.DOM.el.addEventListener('mouseenter', () => {
            this.hoverTimeout = setTimeout(() => {
                // set to last translated values after hovering out
                const {x, y} = getTranslateValues(this.DOM.el);
                this.renderedStyles['tx'].previous = x;
                this.renderedStyles['ty'].previous = y;
                // start the render loop animation (rAF)
                this.loopRender();
            }, 10);
        });
        this.DOM.el.addEventListener('mouseleave', () => {
            if ( this.hoverTimeout ) {
                clearTimeout(this.hoverTimeout);
            }
            // stop the render loop animation (rAF)
            this.stopRendering();
        });
    }
    // start the render loop animation (rAF)
    loopRender() {
        if ( !this.requestId ) {
            this.requestId = requestAnimationFrame(() => this.render());
        }
    }
    // stop the render loop animation (rAF)
    stopRendering() {
        if ( this.requestId ) {
            window.cancelAnimationFrame(this.requestId);
            this.requestId = undefined;
        }
    }
    render() {
        this.requestId = undefined;

        const scrollDiff = {
            x: this.scrollVal.x - window.scrollX,
            y: this.scrollVal.y - window.scrollY
        };
        
        // new values for the translations
        this.renderedStyles['tx'].current = (mousepos.x - (scrollDiff.x + this.rect.left + this.rect.width/2))*.3;
        this.renderedStyles['ty'].current = (mousepos.y - (scrollDiff.y + this.rect.top + this.rect.height/2))*.3;
        
        for (const key in this.renderedStyles ) {
            this.renderedStyles[key].previous = lerp(this.renderedStyles[key].previous, this.renderedStyles[key].current, this.renderedStyles[key].amt);
        }
        
        gsap.set(this.DOM.el, {
            x: this.renderedStyles['tx'].previous,
            y: this.renderedStyles['ty'].previous
        })

        this.loopRender();
    }
}
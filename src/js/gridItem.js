import { gsap } from 'gsap';
import { map, lerp, getMousePos, calcWinsize, getRandomNumber } from './utils';
import { MagneticFx }  from './magneticFx';
import { Preview }  from './preview';

// Calculate the viewport size
let winsize = calcWinsize();
window.addEventListener('resize', () => winsize = calcWinsize());

// Track the mouse position
let mousepos = {x: winsize.width/2, y: winsize.height/2};
window.addEventListener('mousemove', ev => mousepos = getMousePos(ev));

export class GridItem {
    constructor(el) {
        this.DOM = {el: el};
        // the inner image
        this.DOM.image = this.DOM.el.querySelector('.grid__item-img');
        // the title that will appear next to the mouse cursor when hovering
        this.title = this.DOM.el.dataset.title;
        // amounts to move in each axis when moving the cursor
        this.translationVals = {x: 0, y: 0};
        this.rotationVals = {x: 0, y: 0};
        // get random start and end translation/rotation boundaries
        // translation:
        this.xstart = getRandomNumber(70,100);
        this.ystart = getRandomNumber(40,65);
        // rotation:
        this.rxstart = 5;
        this.rystart = 10;
        // magnetic effect on the image:
        // when hovering on the image, the image will follow the mouse movement
        this.magneticFx = new MagneticFx(this.DOM.image);
        // the content/preview element
        this.DOM.contentEl = document.querySelector(this.DOM.el.href.substring(this.DOM.el.href.lastIndexOf('#')));
        this.preview = new Preview(this.DOM.contentEl);
        // initial style/position
        this.layout();
        // start the rAF render function (translate and rotate the item as we move the mouse)
        this.loopTransformAnimation();
    }
    // initial position on the grid
    // set the rotation and the translationZ
    layout() {
        const rect = this.DOM.el.getBoundingClientRect();
        
        // check if the element is position on the left/top side of the viewport 
        this.isLeft = rect.left+rect.width/2 < winsize.width/2;
        this.isTop = rect.top+rect.height/2 < winsize.height/2;

        this.rY = this.isLeft ?
                        map(rect.left+rect.width/2, 0, winsize.width/2, this.rystart, 0) :
                        map(rect.left+rect.width/2, winsize.width/2, winsize.width, 0, -this.rystart);
        this.rX = this.isTop ?
                        map(rect.top+rect.height/2, 0, winsize.height/2, -this.rxstart, 0) :
                        map(rect.top+rect.height/2, winsize.height/2, winsize.height, 0, this.rxstart);
        this.tZ = this.isLeft ?
                        map(rect.left+rect.width/2, 0, winsize.width/2, -200, -600) :
                        map(rect.left+rect.width/2, winsize.width/2, winsize.width, -600, -200);
        
        gsap.set(this.DOM.el, {
            rotationX: this.rX,
            rotationY: this.rY,
            z: this.tZ
        }); 
    }
    onMouseEnter() {
        this.hoverTimeout = setTimeout(() => {
            //this.stopTransformAnimation();

            if( this.timelineHoverOut ) this.timelineHoverOut.kill();
            
            this.timelineHoverIn = gsap.timeline()
            .addLabel('start', 0)
            .to(this.DOM.image, {
                duration: 0.8,
                ease: 'expo',
                scale: 1.1
            }, 'start')

        }, 10);
    }
    onMouseLeave() {
        //this.loopTransformAnimation();

        if ( this.hoverTimeout ) {
            clearTimeout(this.hoverTimeout);
        }
        
        if( this.timelineHoverIn ) this.timelineHoverIn.kill();
        
        this.timelineHoverOut = gsap.timeline()
        .to(this.DOM.image, {
            duration: 1,
            ease: 'power4',
            x: 0,
            y: 0,
            scale: 1
        });
    }
    loopTransformAnimation() {
        if ( !this.requestId ) {
            this.requestId = requestAnimationFrame(() => this.move());
        }
    }
    // stop the render loop animation (rAF)
    stopTransformAnimation() {
        if ( this.requestId ) {
            window.cancelAnimationFrame(this.requestId);
            this.requestId = undefined;
        }
    }
    // translate/rotate the grid items as we move the mouse
    move() {
        this.requestId = undefined;

        // Calculate the amount to move.
        // Using linear interpolation to smooth things out. 
        // Translation values will be in the range of [-start, start] for a cursor movement from 0 to the window's width/height
        this.translationVals.x = lerp(this.translationVals.x, map(mousepos.x, 0, winsize.width, -this.xstart, this.xstart), 0.04);
        this.translationVals.y = lerp(this.translationVals.y, map(mousepos.y, 0, winsize.height, -this.ystart, this.ystart), 0.04);
        // same for the rotations
        this.rotationVals.x = this.isTop ? lerp(this.rotationVals.x, map(mousepos.y, 0, winsize.height/2, this.rxstart, 0), 0.04) : lerp(this.rotationVals.x, map(mousepos.y, winsize.height/2, winsize.height, 0, -this.rxstart), 0.04);
        this.rotationVals.y = this.isLeft ? lerp(this.rotationVals.y, map(mousepos.x, 0, winsize.width/2, -this.rystart, 0), 0.04) : lerp(this.rotationVals.y, map(mousepos.x, winsize.width/2, winsize.width, 0, this.rystart), 0.04);

        gsap.set(this.DOM.el, {
            x: -this.translationVals.x, 
            y: -this.translationVals.y,
            rotationX: -this.rX-this.rotationVals.x,
            rotationY: -this.rY-this.rotationVals.y
        });

        this.loopTransformAnimation();
    }
}
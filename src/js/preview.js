import { gsap } from 'gsap';

export class Preview {
    constructor(el) {
        // DOM elements
        this.DOM = {el: el};
        // back to grid button
        this.DOM.backCtrl = this.DOM.el.querySelector('.preview__item-back');
        // image elements (outer and inner)
        this.DOM.imgWrap = this.DOM.el.querySelector('.preview__item-imgwrap');
        this.DOM.image = this.DOM.imgWrap.querySelector('.preview__item-img');
        // title
        this.DOM.title = this.DOM.el.querySelector('.preview__item-title');
        // Splitting will run on the title element
        // get the chars
        this.DOM.titleChars = [...this.DOM.title.querySelectorAll('.char')];
        // content
        this.DOM.content = this.DOM.el.querySelector('.preview__item-content');

        // initial styles
        this.init();
    }
    // let's set the initial styles
    // all elements inside the preview will be hidden so we can animate them in after clicking on a grid item
    init() {
        // hide title chars
        gsap.set(this.DOM.titleChars, {opacity: 0, y: '100%'});

        // hide image element
        gsap.set(this.DOM.imgWrap, {y: '100%', rotationX: -20});
        gsap.set(this.DOM.image, {y: '-100%'});

        // hide back ctrl
        gsap.set(this.DOM.backCtrl, {opacity: 0});

        // hide content
        gsap.set(this.DOM.content, {opacity: 0});
    }
}
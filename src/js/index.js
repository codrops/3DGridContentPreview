import { Cursor } from './cursor';
import { Grid } from './grid';
import { preloadImages } from './utils';

// custom cursor
const cursor = new Cursor(document.querySelector('.cursor'));

// Preload  images
preloadImages('.grid__item-img').then(() => {
    // Remove loader (loading class)
    document.body.classList.remove('loading');
    
    // Initialize grid
    const grid = new Grid(document.querySelector('.grid'));
    
    // change cursor text status when hovering a grid item
    grid.on('mouseEnterItem', itemTitle => cursor.DOM.text.innerHTML = itemTitle);
    grid.on('mouseLeaveItem', _ => cursor.DOM.text.innerHTML = '');
});

// mouse effects on all links and others
[...document.querySelectorAll('a, button, .grid__item')].forEach(link => {
    link.addEventListener('mouseenter', () => cursor.enter());
    link.addEventListener('mouseleave', () => cursor.leave());
});
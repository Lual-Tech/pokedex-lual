const buttons = document.querySelectorAll('button');
buttons.forEach(btn => {
    btn.addEventListener('mousedown', () => {
        btn.style.transform = 'scale(0.98)';
        btn.style.transition = 'transform 0.1s';
    });
    btn.addEventListener('mouseup', () => {
        btn.style.transform = 'scale(1)';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('dropdownMenu');

    hamburger.onclick = e => {
        e.stopPropagation();
        menu.classList.toggle('show');
    };

    document.onclick = () => menu.classList.remove('show');
    menu.onclick = e => e.stopPropagation();
});

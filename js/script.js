
document.addEventListener('DOMContentLoaded', () => {
    
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    const pages = document.querySelectorAll('.spa-page');
    const getStartedBtn = document.getElementById('btn-get-started');

    
    function switchPage(targetPageId) {
        
        pages.forEach(page => {
            page.style.display = 'none';
            page.classList.remove('active');
        });

        
        const targetPage = document.getElementById(`page-${targetPageId}`);
        if (targetPage) {
            targetPage.style.display = 'block';
            targetPage.classList.add('active');
        }

        
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-page="${targetPageId}"]`);
        if (activeLink) activeLink.classList.add('active');
        
        
        window.scrollTo(0, 0);
    }

   
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            const targetPage = link.getAttribute('data-page');
            switchPage(targetPage);
        });
    });

    
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            switchPage('dashboard');
        });
    }

    
    document.getElementById('nav-home').addEventListener('click', (e) => {
        e.preventDefault();
        switchPage('landing');
    });

    console.log("Farm Manager SPA initialized successfully!");
});
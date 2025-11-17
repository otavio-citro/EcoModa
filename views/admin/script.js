document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const contentSections = document.querySelectorAll('.content-section');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // ESSENCIAL: Impede a navegação de link

            const targetId = link.getAttribute('data-content');

            // Gerencia links ativos na sidebar
            sidebarLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');

            // Gerencia o conteúdo principal (efeito de transição)
            contentSections.forEach(section => section.classList.remove('active-content'));
            
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active-content');
            }
        });
    });
});
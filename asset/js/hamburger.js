        // Toggle hamburger menu
        document.getElementById('menu-toggle').addEventListener('click', () => {
            const menu = document.getElementById('menu');
            menu.classList.toggle('hidden');
            menu.classList.toggle('flex');
            menu.classList.toggle('flex-col');
            menu.classList.toggle('absolute');
            menu.classList.toggle('top-14');
            menu.classList.toggle('left-0');
            menu.classList.toggle('w-full');
            menu.classList.toggle('bg-white');
            menu.classList.toggle('p-4');
            menu.classList.toggle('shadow-md');
        });

        // Function to check URL status with timeout
        async function checkUrlStatus(url) {
            if (!url || url === "") {
                return 'gray';
            }
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second timeout
                const response = await fetch(url, {
                    method: 'HEAD',
                    mode: 'no-cors', // Use no-cors to avoid CORS issues
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                return 'green';
            } catch (error) {
                return 'yellow';
            }
        }

        // Fetch and populate links from JSON
        async function loadLinks() {
            try {
                const response = await fetch('sitemap.json');
                const data = await response.json();

                // Function to create link card with default gray status
                const createLinkCard = (item) => {
                    const card = document.createElement('div');
                    card.className = 'bg-white p-3 sm:p-4 rounded-lg shadow-md hover:shadow-lg transition relative';
                    const status = !item.url || item.url === '' ? 'gray' : 'gray'; // Default to gray
                    card.innerHTML = `
                        <div class="status-dot status-${status}" id="status-${item.url || item.department}"></div>
                        <a href="${item.url}" target="_blank" class="flex items-center space-x-3 sm:space-x-4">
                            <img src="${item.logo}" alt="${item.department} Logo" class="h-10 w-10 sm:h-12 sm:w-12 object-contain" loading="lazy">
                            <div>
                                <h3 class="text-base sm:text-lg font-bold text-blue-900">${item.department}</h3>
                                <p class="text-xs sm:text-sm text-gray-600">${item.url || '无网址'}</p>
                            </div>
                        </a>
                    `;
                    return card;
                };

                // Populate each section immediately
                data.central.forEach(item => {
                    const card = createLinkCard(item);
                    document.getElementById('central-links').appendChild(card);
                });
                data.stateCouncil.forEach(item => {
                    const card = createLinkCard(item);
                    document.getElementById('state-council-links').appendChild(card);
                });
                data.local.forEach(item => {
                    const card = createLinkCard(item);
                    document.getElementById('local-links').appendChild(card);
                });
                data.hongkongMacau.forEach(item => {
                    const card = createLinkCard(item);
                    document.getElementById('hongkong-mac-links').appendChild(card);
                });
                data.overseas.forEach(item => {
                    const card = createLinkCard(item);
                    document.getElementById('overseas-links').appendChild(card);
                });

                // Hide loading overlay after rendering
                const loadingOverlay = document.getElementById('loading-overlay');
                loadingOverlay.classList.add('hidden');
                setTimeout(() => loadingOverlay.remove(), 500); // Remove after transition

                // Update status dots concurrently
                const updateStatusDots = async () => {
                    const items = [
                        ...data.central,
                        ...data.stateCouncil,
                        ...data.local,
                        ...data.hongkongMacau,
                        ...data.overseas
                    ];
                    const statusPromises = items.map(async (item) => {
                        const status = await checkUrlStatus(item.url);
                        return { id: `status-${item.url || item.department}`, status };
                    });
                    const results = await Promise.all(statusPromises);
                    results.forEach(({ id, status }) => {
                        const statusDot = document.getElementById(id);
                        if (statusDot) {
                            statusDot.className = `status-dot status-${status}`;
                        }
                    });
                };
                updateStatusDots();
            } catch (error) {
                console.error('Error loading sitemap:', error);
                // Hide loading overlay even on error to prevent infinite loading
                const loadingOverlay = document.getElementById('loading-overlay');
                loadingOverlay.classList.add('hidden');
                setTimeout(() => loadingOverlay.remove(), 500);
            }
        }

        // Load links on page load
        document.addEventListener('DOMContentLoaded', loadLinks);
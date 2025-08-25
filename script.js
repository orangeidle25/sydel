window.onload = function() {
    const API_KEY = 'YOUR_API_KEY';
    const SEARCH_ENGINE_ID = 'YOUR_SEARCH_ENGINE_ID';

    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');

    async function performSearch(query) {
        const apiUrl = `https://www.googleapis.com/customsearch/v1?key=$AIzaSyDuJt3FMlYWrYT3VttF3RxE_9Edtv1mWHk&cx=$51bd68c19eef74771&q=${encodeURIComponent(query)}`;

        resultsContainer.innerHTML = '<p class="text-center text-gray-500">Searching...</p>';

        try {
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                resultsContainer.innerHTML = '';

                data.items.forEach(item => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'bg-white p-6 rounded-xl shadow-md mb-4';

                    resultItem.innerHTML = `
                        <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline text-xl font-bold">
                            ${item.title}
                        </a>
                        <p class="text-sm text-gray-600 mt-1">${item.displayLink}</p>
                        <p class="text-gray-800 mt-2">${item.snippet}</p>
                    `;
                    resultsContainer.appendChild(resultItem);
                });
            } else {
                resultsContainer.innerHTML = '<p class="text-center text-gray-500">No results found for your query.</p>';
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
            resultsContainer.innerHTML = `<p class="text-center text-red-500">An error occurred while fetching search results. Please try again.</p>`;
        }
    }

    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const query = searchInput.value.trim();

        if (query) {
            performSearch(query);
        }
    });
};

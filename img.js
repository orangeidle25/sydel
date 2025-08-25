window.onload = function() {
    const API_KEY = 'AIzaSyCYmAwbDWDIkjrHNr-fGHHZXEBaaVyNEuE';
    const SEARCH_ENGINE_ID = '70fe7bdbad9f64561';

    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');
    const paginationContainer = document.getElementById('pagination-container');

    async function performSearch(query, page = 1) {
        const start = (page - 1) * 10 + 1;
        
        const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&searchType=image&start=${start}`;

        resultsContainer.innerHTML = '<p class="text-center text-gray-500">Searching for images...</p>';
        paginationContainer.innerHTML = '';

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
                    resultItem.className = 'w-full p-2';

                    let imageSrc = item.pagemap?.cse_image?.[0]?.src;

                    if (!imageSrc && item.link && (item.link.endsWith('.jpg') || item.link.endsWith('.jpeg') || item.link.endsWith('.png') || item.link.endsWith('.gif') || item.link.endsWith('.webp'))) {
                        imageSrc = item.link;
                    }
                    
                    if (imageSrc) {
                        resultItem.innerHTML = `
                            <div class="relative w-full pb-[100%] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                                <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="absolute inset-0 block">
                                    <img src="${imageSrc}" alt="${item.title}" class="w-full h-full object-contain">
                                </a>
                            </div>
                        `;
                        resultsContainer.appendChild(resultItem);
                    }
                });
                
                renderPagination(query, page, data.queries.request[0].totalResults);
            } else {
                resultsContainer.innerHTML = '<p class="text-center text-gray-500">No images found for your query.</p>';
            }
        } catch (error) {
            console.error('Error fetching image results:', error);
            resultsContainer.innerHTML = `<p class="text-center text-red-500">An error occurred while fetching image results. Please try again.</p>`;
        }
    }

    function renderPagination(query, currentPage, totalResults) {
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(totalResults / 10);
        const hasNextPage = currentPage < totalPages;
        const hasPreviousPage = currentPage > 1;

        if (hasPreviousPage) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Previous';
            prevButton.className = 'bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-300 transition duration-300';
            prevButton.addEventListener('click', () => {
                performSearch(query, currentPage - 1);
            });
            paginationContainer.appendChild(prevButton);
        }

        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        pageInfo.className = 'text-gray-600 font-medium px-4';
        paginationContainer.appendChild(pageInfo);

        if (hasNextPage) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.className = 'bg-blue-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-700 transition duration-300';
            nextButton.addEventListener('click', () => {
                performSearch(query, currentPage + 1);
            });
            paginationContainer.appendChild(nextButton);
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

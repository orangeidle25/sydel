window.onload = function() {
    const API_KEY = 'AIzaSyCYmAwbDWDIkjrHNr-fGHHZXEBaaVyNEuE';
    const SEARCH_ENGINE_ID = '51bd68c19eef74771';

    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');
    const paginationContainer = document.getElementById('pagination-container');

    async function performSearch(query, page = 1) {
        const start = (page - 1) * 10 + 1;
        const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&start=${start}`;

        resultsContainer.innerHTML = '<p class="text-center text-gray-500">Searching...</p>';
        paginationContainer.innerHTML = '';

        try {
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                resultsContainer.innerHTML = '';
                const snippets = [];
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
                    snippets.push(item.snippet);
                });
                renderPagination(query, page, data.queries.request[0].totalResults);
                renderSummarizeButton(snippets);
            } else {
                resultsContainer.innerHTML = '<p class="text-center text-gray-500">No results found for your query.</p>';
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
            resultsContainer.innerHTML = `<p class="text-center text-red-500">An error occurred while fetching search results. Please try again.</p>`;
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
    
    function renderSummarizeButton(snippets) {
        const summarizeButton = document.createElement('button');
        summarizeButton.textContent = '✨ Summarize Results';
        summarizeButton.className = 'bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 ease-in-out shadow-md mt-4';
        summarizeButton.addEventListener('click', () => summarizeResults(snippets));
        resultsContainer.prepend(summarizeButton);
    }
    
    async function summarizeResults(snippets) {
        const prompt = `Summarize the following text snippets into a single, cohesive paragraph:\n\n${snippets.join('\n\n')}`;
        const apiKey = ""; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;
        
        const summaryContainer = document.createElement('div');
        summaryContainer.className = 'bg-purple-100 p-6 rounded-xl shadow-md mb-4 text-purple-800 relative';
        
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.className = 'absolute top-2 right-4 text-purple-600 text-2xl font-bold cursor-pointer hover:text-purple-800';
        closeButton.addEventListener('click', () => summaryContainer.remove());
        
        const summaryText = document.createElement('p');
        summaryText.className = 'animate-pulse';
        summaryText.textContent = 'Generating summary...';

        summaryContainer.appendChild(closeButton);
        summaryContainer.appendChild(summaryText);
        resultsContainer.prepend(summaryContainer);
        
        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: prompt }]
            }]
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            const summary = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (summary) {
                summaryText.textContent = summary;
                summaryText.classList.remove('animate-pulse');
            } else {
                summaryText.textContent = 'Failed to generate summary. Please try again.';
                summaryText.classList.remove('animate-pulse');
                summaryText.classList.add('bg-red-100', 'text-red-800');
            }
        } catch (error) {
            console.error('Error generating summary:', error);
            summaryText.textContent = 'An error occurred. Please try again.';
            summaryText.classList.remove('animate-pulse');
            summaryText.classList.add('bg-red-100', 'text-red-800');
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
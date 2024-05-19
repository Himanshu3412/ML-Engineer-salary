document.addEventListener('DOMContentLoaded', () => {
    fetch('data/ml_engineer_salaries.json')
        .then(response => response.json())
        .then(data => {
            const mainTableBody = document.querySelector('#mainTable tbody');
            const detailTable = document.querySelector('#detailTable');
            const detailTableBody = document.querySelector('#detailTable tbody');

            function renderMainTable() {
                mainTableBody.innerHTML = data.map(row => 
                    ` <tr data-year="${row.year}">
                        <td>${row.year}</td>
                        <td>${row.total_jobs}</td>
                        <td>${row.average_salary}</td>
                    </tr>
                `).join('');
            }

            function renderDetailTable(year) {
                const rowData = data.find(row => row.year === year);
                if (rowData) {
                    detailTableBody.innerHTML = Object.entries(rowData.job_titles).map(([title, count]) => `
                        <tr>
                            <td>${title}</td>
                            <td>${count}</td>
                        </tr>
                    `).join('');
                    detailTable.style.display = 'table';
                }
            }

            function sortTable(columnIndex) {
                const isNumeric = (str) => !isNaN(str);

                data.sort((a, b) => {
                    const keyA = isNumeric(a[columnIndex]) ? parseFloat(a[columnIndex]) : a[columnIndex];
                    const keyB = isNumeric(b[columnIndex]) ? parseFloat(b[columnIndex]) : b[columnIndex];
                    return keyA > keyB ? 1 : -1;
                });
                renderMainTable();
            }

            renderMainTable();

            document.querySelector('#mainTable').addEventListener('click', (e) => {
                if (e.target.tagName === 'TH') {
                    const columnIndex = Array.from(e.target.parentNode.children).indexOf(e.target);
                    sortTable(columnIndex);
                } else if (e.target.tagName === 'TD') {
                    const year = parseInt(e.target.parentElement.dataset.year);
                    renderDetailTable(year);
                }
            });

            function renderLineGraph() {
                const aggregatedData = {};
                
                // Aggregate total jobs by year
                data.forEach(entry => {
                    const year = entry.year;
                    const totalJobs = entry.total_jobs;
                    
                    if (!aggregatedData[year]) {
                        aggregatedData[year] = 0;
                    }
                    
                    aggregatedData[year] += totalJobs;
                });
                
                // Convert aggregated data to array of objects
                const aggregatedArray = Object.keys(aggregatedData).map(year => {
                    return { year: parseInt(year), total_jobs: aggregatedData[year] };
                });
            
                const margin = { top: 20, right: 30, bottom: 30, left: 40 };
                const width = 800 - margin.left - margin.right;
                const height = 400 - margin.top - margin.bottom;
            
                const svg = d3.select('#chart').append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform', `translate(${margin.left},${margin.top})`);
            
                const x = d3.scaleLinear()
                    .domain([2020, 2024])
                    .range([0, width]);
            
                const y = d3.scaleLinear()
                    .domain([0, d3.max(aggregatedArray, d => d.total_jobs)])
                    .range([height, 0]);
            
                // Adjust x-axis ticks to show only one tick per year
                const xAxis = d3.axisBottom(x)
                    .tickValues(aggregatedArray.map(d => d.year))
                    .tickFormat(d3.format('d'));
            
                svg.append('g')
                    .attr('transform', `translate(0,${height})`)
                    .call(xAxis);
            
                svg.append('g')
                    .call(d3.axisLeft(y));
            
                svg.append('path')
                    .datum(aggregatedArray)
                    .attr('fill', 'none')
                    .attr('stroke', 'steelblue')
                    .attr('stroke-width', 1.5)
                    .attr('d', d3.line()
                        .x(d => x(d.year))
                        .y(d => y(d.total_jobs))
                    );
            }
            

            renderLineGraph();
        });
});

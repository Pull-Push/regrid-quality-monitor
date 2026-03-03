const fs = require("fs");
const path = require("path");

//Generate HTML dashboard from validation results

function generateHTML(validationData) {
	const stats = validationData.statistics;
	const results = validationData.results;

	//Calculate Score Color
	const getScoreColor = (score) => {
		if (score >= 90) return "#10b981";
		if (score >= 75) return "#f59e0b";
		return "#ef4444";
	};

	//Generate parcel rows
	const parcelRows = results.map((results, index) => {
			const address = results.parcel.address;
			const score = results.overall;
			const passed = results.checksPassed;
			const failed = results.checksFailed;
			const scoreColor = getScoreColor(score);

			return `
        <tr>
            <td>${index + 1}</td>
            <td class='address-cell'>${address}</td>
            <td>
                <div class='score-badge' style='background: ${scoreColor}'>
                    ${score}
                </div>
            </td>
            <td>
                <span class="status-pass">${passed}</span>
            </td>
            <td>
                <span class="status-fail">${failed}</span>
            </td>
        </tr>
        `;
		})
		.join("");

	//Generate Category Bars
	const categoryBars = Object.entries(stats.categoryScores)
		.map(([category, score]) => {
			const color = getScoreColor(score);
			return `
                <div class="category-item">
                    <div class="category-header">
                        <span class="category-name">${category}</span>
                        <span class="category-score">${score}</span>
                    </div>
                    <div class="category-bar">
                        <div class="category-fill" style="width: ${score}%; background: ${color}"></div>
                    </div>
                </div>
            `;
		})
		.join("");

	//Generate Top Failures
	const failureItems = stats.topFailures
    .map(
        (failure) => `
        <div class='failure-item'>
            <span class="failure-name">${failure.check}</span>
            <span class="failure-count">${failure.failures} failures</span>
        </div>
    `,
    )
    .join("");

	const overallColor = getScoreColor(stats.averageScore);

	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Regrid Data Quality Report</title>
    <style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        padding: 40px 20px;
    }

    .container {
        max-width: 1400px;
        margin: 0 auto;
    }

    .header {
        text-align: center;
        color: white;
        margin-bottom: 40px;
    }

    .header h1 {
        font-size: 48px;
        font-weight: 700;
        margin-bottom: 10px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header .subtitle {
        font-size: 18px;
        opacity: 0.9;
    }

    .header .timestamp {
        font-size: 14px;
        opacity: 0.7;
        margin-top: 10px;
    }

    .dashboard {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
        margin-bottom: 30px;
    }

    .card {
        background: white;
        border-radius: 16px;
        padding: 30px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .card:hover {
        transform: translateY(-4px);
        box-shadow: 0 15px 40px rgba(0,0,0,0.15);
    }

    .card-title {
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #6b7280;
        margin-bottom: 20px;
    }

    .score-display {
        text-align: center;
        padding: 20px;
    }

    .score-circle {
        width: 180px;
        height: 180px;
        margin: 0 auto 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 64px;
        font-weight: 700;
        color: white;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        position: relative;
    }

    .score-circle::before {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%);
        z-index: -1;
    }

    .score-label {
        font-size: 18px;
        color: #6b7280;
        font-weight: 500;
    }

    .stat-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }

    .stat-item {
        text-align: center;
        padding: 15px;
        background: #f9fafb;
        border-radius: 12px;
    }

    .stat-value {
        font-size: 32px;
        font-weight: 700;
        color: #111827;
        margin-bottom: 5px;
    }

    .stat-label {
        font-size: 13px;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .category-item {
        margin-bottom: 20px;
    }

    .category-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
    }

    .category-name {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        text-transform: capitalize;
    }

    .category-score {
        font-size: 14px;
        font-weight: 700;
        color: #111827;
    }

    .category-bar {
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
    }

    .category-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 1s ease;
    }

    .failure-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: #fef3c7;
        border-radius: 8px;
        margin-bottom: 10px;
        border-left: 4px solid #f59e0b;
    }

    .failure-name {
        font-size: 14px;
        font-weight: 600;
        color: #92400e;
    }

    .failure-count {
        font-size: 13px;
        font-weight: 700;
        color: #b45309;
        background: white;
        padding: 4px 12px;
        border-radius: 12px;
    }

    .table-card {
        grid-column: 1 / -1;
    }

    .table-wrapper {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th {
        background: #f9fafb;
        padding: 16px;
        text-align: left;
        font-size: 13px;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 2px solid #e5e7eb;
    }

    td {
        padding: 16px;
        border-bottom: 1px solid #e5e7eb;
        font-size: 14px;
        color: #374151;
    }

    tr:hover {
        background: #f9fafb;
    }

    .address-cell {
        font-weight: 500;
        color: #111827;
    }

    .score-badge {
        display: inline-block;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 16px;
        font-weight: 700;
        color: white;
    }

    .status-pass {
        color: #10b981;
        font-weight: 600;
    }

    .status-fail {
        color: #ef4444;
        font-weight: 600;
    }

    .footer {
        text-align: center;
        color: white;
        margin-top: 40px;
        padding: 20px;
        opacity: 0.8;
    }

    @media (max-width: 768px) {
        .header h1 {
        font-size: 32px;
        }

        .dashboard {
        grid-template-columns: 1fr;
        }

        .stat-grid {
        grid-template-columns: 1fr;
        }
    }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Regrid Data Quality Report</h1>
            <div class="subtitle">Automated Quality Assessment Across ${stats.totalParcels} Parcels</div>
            <div class="timestamp">Generated: ${new Date(validationData.validatedAt).toLocaleString()}</div>
        </div>
    
    <div class="dashboard">
        <!-- Overall Score -->
        <div class="card">
            <div class="card-title">Overall Quality Score</div>
            <div class="score-display">
                <div class="score-circle" style="background: ${overallColor}">
                    ${stats.averageScore}
                </div>
                <div class="score-label">out of 100</div>
            </div>
        </div>
        
        <!-- Summary Stats -->
            <div class="card">
                <div class="card-title">Summary Statistics</div>
                <div class="stat-grid">
                    <div class="stat-item">
                        <div class="stat-value">${stats.totalParcels}</div>
                        <div class="stat-label">Parcels</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${stats.totalChecks}</div>
                        <div class="stat-label">Total Checks</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" style="color: #10b981">${stats.totalPassed}</div>
                        <div class="stat-label">Passed</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" style="color: #ef4444">${stats.totalFailed}</div>
                        <div class="stat-label">Failed</div>
                    </div>
                </div>
            </div>

        <!-- Score Range -->
            <div class="card">
                <div class="card-title">Score Distribution</div>
                <div class="stat-grid">
                    <div class="stat-item">
                        <div class="stat-value" style="color: #10b981">${stats.maxScore}</div>
                        <div class="stat-label">Highest</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" style="color: #f59e0b">${stats.minScore}</div>
                        <div class="stat-label">Lowest</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" style="color: #10b981">${stats.passRate}%</div>
                        <div class="stat-label">Pass Rate</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" style="color: #ef4444">${stats.failRate}%</div>
                        <div class="stat-label">Fail Rate</div>
                    </div>
                </div>
            </div>

        <!-- Category Breakdown -->
            <div class="card">
                <div class="card-title">Quality by Category</div>
                ${categoryBars}
            </div>

        <!-- Top Failures -->
            <div class="card">
                <div class="card-title">Top Data Issues</div>
                    ${failureItems || '<div style="color: #10b981; text-align: center; padding: 20px;">✨ No failures detected!</div>'}
            </div>
        
        <!-- Parcel Details Table -->
            <div class="card table-card">
                <div class="card-title">Individual Parcel Results</div> 
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Address</th>
                                <th>Score</th>
                                <th>Passed</th>
                                <th>Failed</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${parcelRows}
                        </tbody>
                    </table>
                </div>
            </div>
    </div>
    
    <div class="footer">
        <p>Regrid Data Quality Monitor v1.0</p>
        <p>Built with Jest • Powered by Regrid API</p>
    </div>
    </div>
</body>
</html>
`;
}


//Find the most recent validation file and generate report
function findLatestValidationFile(){
    const dataPath = path.join(__dirname, '../../data');

    if(!fs.existsSync(dataPath)){
        throw new Error('No data directory found!')
    }

    const files = fs.readdirSync(dataPath)
        .filter(f => f.startsWith('validation-') && f.endsWith('.json'))
        .sort()
        .reverse();

    if (files.length === 0){
        throw new Error('No Validation files found! Run Validator First!!')
    }

    return path.join(dataPath, files[0])
}

//Generate and save HTML Report

function generateReport(){
    console.log('Generating HTML Report')
    //find latest validation files
    const validationFile = findLatestValidationFile()
    console.log(`Reading ${path.basename(validationFile)}`)

    const validationData = JSON.parse(fs.readFileSync(validationFile, 'utf-8'))

    //Generate HTML
    const html  = generateHTML(validationData)

    //save Report
    const reportsPath = path.join(__dirname, '../../reports');
    if(!fs.existsSync(reportsPath)){
        fs.mkdirSync(reportsPath, {recursive: true}); 
    }
    const filename = `report-${Date.now()}.html`;
    const filepath = path.join(reportsPath, filename)

    fs.writeFileSync(filepath, html)

    console.log('Report Generated Successfully!')
    console.log(`Location: ${filepath}`)
    console.log('Open in browser to view the dashboard')

    return filepath
}

//Run if called directly
if(require.main === module) {
    try {
        generateReport()
    } catch (error) {
        console.error('Report Generation Failed', error.message);
        process.exit(1)
    }
}

module.exports = {generateReport, generateHTML}
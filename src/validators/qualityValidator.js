const fs = require('fs')
const path = require('path')
const {ALL_CHECKS} = require('./qualityChecks')

//RUN ALL QUALITY CHECKS ON A SINGLE PARCEL

function validateParcel(parcel){
    const results = {};
    let totalScore = 0;
    let checksRun = 0;


    for(const check of ALL_CHECKS){
        console.log(`Running ${check.name}`)
        try{
            const result = check.fn(parcel);
            results[check.name] = {
                ...result,
                category: check.category
            };
            totalScore += result.score;
            checksRun++;
        }catch (error){
            console.error(error)
            results[check.name] ={
                pass:false,
                message: `Check failed: ${error.message}`,
                score:0,
                category: check.category
            };
            checksRun++
        }
    }

    const overall = checksRun > 0 ? Math.round(totalScore/checksRun) : 0;

    return {
        parcel: parcel,
        checks:results,
        overall: overall,
        checksRun: checksRun,
        checksPassed: Object.values(results).filter(r => r.pass).length,
        checksFailed: Object.values(results).filter(r => !r.pass).length
    }
}

//Validate all parcels from data file

function validateDataFile(filepath){
    console.log(`Loading data from ${filepath}`)

    const rawData = fs.readFileSync(filepath,'utf-8')
    const data = JSON.parse(rawData)

    console.log(`Found ${data.parcels.length} parcels to validate`)
    console.log('Running Quality Checks...')

    const validationResults = []

    for(let i=0; i <data.parcels.length; i++){
        const parcel = data.parcels[i]
        console.log(`[${i+1}/${data.parcels.length}] Validating: ${parcel.address}`)

        const result = validateParcel(parcel)
        validationResults.push(result)

        console.log(`Score ${result.overall}/100 (${result.checksPassed}/${result.checksRun} passed)`)
    }

    //calculate aggregate stats
    const stats = calculateStats(validationResults)

    //save validation results
    const resultsPath = path.join(__dirname, '../../data');
    const filename = `validation-${Date.now()}.json`;
    const resultsFile = path.join(resultsPath, filename)

    const output = {
        validatedAt: new Date().toISOString(),
        sourceFile: path.basename(filepath),
        statistics: stats,
        results: validationResults
    };

    fs.writeFileSync(resultsFile, JSON.stringify(output, null, 2));

console.log('VALIDATION RESULTS')
console.log(`Overall Quality Score: ${stats.averageScore}/100`)
console.log(`Parcels Tested: ${stats.totalParcels}`)
console.log(`Total Checks Run: ${stats.totalChecks}`)
console.log(`Checks Passed: ${stats.totalPassed} (${stats.passRate}%)`)
console.log(`Checks Failed: ${stats.totalFailed} (${stats.failRate}%)`)
console.log(`Results Saved To: ${filename}`)

return output
}

//calculate agg stats

function calculateStats(results){
    const totalParcels = results.length;
    const scores = results.map(r => r.overall)
    const averageScore = Math.round(scores.reduce((a, b) => a+b, 0) /scores.length)

    const totalChecks = results.reduce((sum, r) => sum + r.checksRun, 0)
    const totalPassed = results.reduce((sum, r) => sum + r.checksPassed, 0)
    const totalFailed = results.reduce((sum, r) => sum + r.checksFailed, 0)

    const passRate = Math.round((totalPassed /totalChecks) *  100);
    const failRate = Math.round((totalFailed / totalChecks) * 100);

    //category breakdown
    const categoryScores = {}
    const categories = ['geometry', 'address', 'property', 'identifiers', 'validation', 'zoning', 'building', 'metadata']

    for(const category of categories){
        let categoryChecks = [];

        for(const result of results){
            for(const [checkName, checkResult] of Object.entries(result.checks)){
                if (checkResult.category === category){
                    categoryChecks.push(checkResult.score)
                }
            }
        }
        if(categoryChecks.length > 0){
            const avgScore = Math.round(categoryChecks.reduce((a, b) => a+b, 0) /categoryChecks.length);
            categoryScores[category] = avgScore
        }
    }

    //Find Most Common Failures
    const failureCount = {}
    for(const result of results){
        for(const [checkName, checkResult] of Object.entries(result.checks)){
            if(!checkResult.pass){
                failureCount[checkName] = (failureCount[checkName] || 0) + 1;
            }
        }
    }

    const topFailures = Object.entries(failureCount)
        .sort((a,b) => b[1] - a[1])
        .slice(0,5)
        .map(([name, count]) => ({check: name, failures: count}));
    
    return {
        totalParcels,
        averageScore,
        minScore: Math.min(...scores),
        maxScore: Math.max(...scores),
        totalChecks,
        totalPassed,
        totalFailed,
        passRate,
        failRate,
        categoryScores,
        topFailures
    }
}

//Find the most recent data file
function findLatestDataFile(){
    const dataPath = path.join(__dirname, '../../data');

    if(!fs.existsSync(dataPath)){
        throw new Error('No data directory found. Run collector first!!')
    }

    const files = fs.readdirSync(dataPath)
    .filter(f => f.startsWith('parcels-') && f.endsWith('.json'))
    .sort()
    .reverse()

    if(files.length === 0){
        throw new Error('No parcel data found. Run Collector First!')
    }
    return path.join(dataPath, files[0])
}

//Run if called directly
if(require.main === module){
    try{
        const latestFile = findLatestDataFile()
        validateDataFile(latestFile)
    }catch(error){
        console.error('Validation Failed!', error.message);
        process.exit(1)
    }
}

module.exports = {
    validateParcel,
    validateDataFile,
    calculateStats
}
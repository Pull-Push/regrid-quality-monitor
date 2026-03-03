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
        console.log(`[${i+1}/${data.parcels.legth}] Validating: ${parcel.address}`)

        const result = validateParcel(parcel)
        validationResults.push(result)

        console.log(`Score ${result.overall}/100 (${result.checksPassed}/${result.checksRun} passed)`)
    }

    //calculate aggregate stats
    const stats = calculateStats(validationResults)

    //save validation results
    const resultsPath = path.join(__dirname, '../../data');
    const filename = `validation-${Date.now()}.json`;
    const resultsFile = path.join(resultsPath.filename)

    const output = {
        validatedAt: new Date().toISOString().at,
        sourceFile: path.basename(filename),
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
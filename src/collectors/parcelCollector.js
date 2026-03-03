require('dotenv').config()
const axios = require('axios');
const { timeStamp, error } = require('console');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.REGRID_API_KEY;
const BASE_URL = 'https://app.regrid.com/api/v2';


/* INCLUDED DATA FOR SAMPLE COUNTIES!!!
    - Marion County, Indiana
    - Dallas County, Texas
    - Wilson County, Tennesee
    - Durham County, North Carolina
    - Filmore County, Nebraska
    - Clark County, Wisconsin
    - Guarbo Municipo, Puerto Rico
*/

//TEST ADDRESSES ACROSS DIFFERENT COUNTIES
const TEST_ADDRESSES = [
    '1245 Fake Rd, Pompton Lakes, NJ', //COMPLETE BS ADDY
    '5818 Diana Dr, Garland, TX', //Dallas County
    '6535 N Ewing St, Indianapolis, IN', //Marion County
    '1660 Martha-Leeville Rd, Lebanon, TN', //Wilson County
    '1004 Scholastic Cir, Durham, NC', //Durham County    
    '313 Main St, Strang, NE', //Filmore County - BUSINESS ADDY
    'N 5664 County Rd Y, Chili, WI', //Clark County - BUSINESS ADDY
    '2 Calle Santiago, Gurabo, 00778, Puerto Rico' //Guarbo - VERIFY IF WORKS
];

async function fetchParcel(address) {
    try {
        const response = await axios.get(`${BASE_URL}/parcels/address.json`, {
            params: {
                token: API_KEY,
                query: address,
                limit: 1
            },
            timeout:5000
        });

        if(response.data.parcels?.features?.length > 0) {
            return{
                success:true,
                address:address,
                data: response.data.parcels.features[0],
                timeStamp: new Date().toISOString()
            };
        }
            return {
                success:false,
                address:address,
                error: 'No parcels found',
                timeStamp: new Date().toISOString()
            }
        
    } catch (error) {
        return {
            success:false,
            address:address,
            error: error.message,
            timeStamp: new Date().toISOString()
        }
    }
}

async function collectParcels(count = 100) {
    console.log(`Collecting ${count} parcel samples...`)
    const parcels = [];
    const errors = [];

    //using test addresses for now
    for (let i = 0; i< Math.min(count, TEST_ADDRESSES.length); i++){
        const address = TEST_ADDRESSES[i]
        console.log(`Fetching: ${address}...`)

        const result = await fetchParcel(address);

        if(result.success){
            parcels.push(result);
        }else{
            errors.push(result);
        }

        //Make sure we handle rate limits!!!!
        await new Promise(resolve => setTimeout(resolve,200));
        }
        //Save RAW Data
        const dataPath = path.join(__dirname, '../../data');
        if(!fs.existsSync(dataPath)){
            fs.mkdirSync(dataPath, {recursive:true});
        }
        const filename = `parcels-${Date.now()}.json`;
        const filepath = path.join(dataPath, filename)

        const output = {
            collectedAt: new Date().toISOString(),
            totalRequested: count,
            totalCollected: parcels.length,
            totalErrors: errors.length,
            parcels: parcels,
            errors: errors
        };

        fs.writeFileSync(filepath, JSON.stringify(output, null, 2));

        console.log(`Collected ${parcels.length} parcels`)
        console.log(`Failed ${errors.length} requests`)
        console.log(`Saved to: ${filename}`)

        return output;
}

//RUN IF CALLED DIRECTLY
if (require.main === module){
    collectParcels(10).then(() =>{
        console.log('Collection Complete!');
    }).catch(error =>{
        console.error('Collection Failed!', error)
        process.exit(1);
    })
}


module.exports = { collectParcels, fetchParcel };

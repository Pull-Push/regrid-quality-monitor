/*
Individual quality check functions
Each returns { pass:bool, message:string, score:number}
*/

//Geometry Checks
function validateGeometry(parcel){
    const geometry = parcel.data?.geometry;

    if(!geometry){
        return {pass: false, message: 'Missing Geometry', score : 0};
    }

    if(geometry.type !== 'Polygon') {
        return {pass: false, message: `Invalid geometry type: ${geometry.type}`, score: 0};
    }
    if(!geometry.coordinates || geometry.coordinates.length === 0){
        return { pass: false, message: 'Missing coordinates', score:0};
    }

    const ring = geometry.coordinates[0];

    if(ring.length < 4 ){
        return {pass:false, message: 'Polygon has fewer than 4 points', score:0};
    }

    //Check closed ring
    const first = ring[0]
    const last = ring[ring.length-1];
    const isClosed = first[0] === last[0] && first[1] === last[1];

    if(!isClosed) {
        return { pass: false, message: 'Polygon not closed', score:50};
    }
    return { pass:true, message: 'Valid geometry', score:100};
}

function validateCoordinates(parcel){
    const geometry = parcel.data?.geometry;

    if(!geometry?.coordinates?.[0]){
        return {pass: false, message: 'No coordinates', score:0};
    }

    const ring = geometry.coordinates[0];

    for(const [lng, lat] of ring){
        if(lng < -180 || lng >180){
            return {pass: false, message: `Invalid longitude: ${lng}`, score:0};
        }
        if(lat < -90 || lat > 90 ){
            return {pass: false, message:`Invalid latitude: ${lat}`, score:0}
        }
    }

    return {pass:true, message: 'Valid Coordinates', score:100};
}

//Address Checks
function validateAddress(parcel){
    const fields = parcel.data?.properties?.fields;

    if(!fields.address){
        return {pass:false, message:'Missing address', score:0};
    }

    const address = fields.address
    //Basic format check
    if (address.length < 5){
        return {pass:false, message:'Address too short', score:30};
    }

    //Should have numbers
    if(!/\d/.test(address)){
        return {pass: false, message:'Address missing street number', score:50};
    }
    return {pass:true, message:'Valid Address',score:100};
}

function validateStateCode(parcel){
    const fields = parcel.data?.properties?.fields

    if(!fields.state2){
        return {pass:false, message:'Missing state code', score:0}
    }
    const state = fields.state2

    if(state.length !== 2){
        return {pass: false, message:`Invalid state code lenngth ${state}`, score:0}
    }
    if(!/^[A-Z]{2}$/.test(state)) {
        return {pass:false, message:`Invalid state code format: ${state}`, score:50};
    }
    return {pass: true, message:'Valid state code', score:100}
}

function validateZipCode(parcel){
    const fields = parcel.data?.properties?.fields;

    if(!fields?.szip5){
        return {pass:false, message:'Missing ZIP code', score:0}
    }

    const zip = fields.szip5

    if(!/^\d{5}$/.test(zip)){
        return {pass:false, message:`Invalid ZIP format ${zip}`, score:0}
    }
    return {pass: true, message:'Valid ZIP code', score:100};
}

//Property Data Checks
function validateOwner(parcel){
    const fields = parcel.data?.properties?.fields;

    if (!fields?.owner){
        return {pass: false, message:'Missing owner', score:0}
    }

    if(fields.owner.length < 2) {
        return {pass: false, message: 'Owner name too short', score:30}
    }
    return {pass:true, message:'Has owner data', score:100};
}

function validatePropertyValue(parcel){
    const fields = parcel.data?.properties?.fields;

    if(!fields?.parval && !fields?.landval){
        return {pass:false, message:'Missing property values', score:0};
    }
    if(fields?.parval && fields?.landval <= 0){
        return {pass: false, message:'Invalid property values', score:0}
    }
    return {pass: true, message: 'Has property value data', score:100};
}

function validateYearBuilt(parcel){
    const fields = parcel.data?.properties?.fields

    if(!fields?.yearbuilt){
        return{ pass:false, message:'Missing year built', score:70} //Not as critical
    }
    const year = fields.yearbuilt;
    const currentYear = new Date().getFullYear();

    if(year < 1600 || year > currentYear+1){
        return {pass: false, message:`Unrealistic year: ${year}`, score: 30}; 
    }
    return {pass:true, message:'Valid year built', score:100 }
}

//Identifier Checks
function validateUUID(parcel){
    const fields = parcel.data?.properties?.fields

    if(!fields?.ll_uuid){
        return { pass:false, message: 'Missing UUID format', score:0 }
    }

    const uuid = fields.ll_uuid
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

    if(!uuidPattern.test(uuid)){
        return {pass: false, message: 'Invalid UUID format', score:0}
    }

    return {pass:true, message: 'Valid UUID', score:100};
}

function validateParcelNumber(parcel){
    const fields = parcel.data?.properties?.fields;

    if(!fields?.parcelnumb){
        return {pass: false, message:'Missing parcel number', score:0}
    }
    return {pass: true, message: 'Has Parcel number', score: 100}
}

//USPS Validation
function validateUSPS(parcel){
    const fields = parcel.data?.properties?.fields
    if(!fields?.dpv_status){
        return {pass: false, message:'Missing USPS validation', score: 70}
    }

    const validStatuses = ['V', "D", "S"];
    if(!validStatuses.includes(fields.dpv_status)){
        return {pass:false, message:`Unknown DPV status: ${fields.dpv_status}`, score:50}
    }

    return { pass: true, message: 'USPS validated', score:100}
}

//Zoning Data
function validateZoning(parcel){
    const fields = parcel.data?.properties?.fields
    if(!fields?.zoning){
        return {pass: false, message: 'Missing zoning data', score: 0}
    }

    if(!fields?.zoning_description){
        return {pass: false, message: 'Missing zoning description', score: 70}
    }

    return {pass: true, message: 'Has zoning data',score: 100}
}

//Building Data
function validateBuildingData(parcel){
    const fields = parcel.data?.properties?.fields
    if(!fields?.ll_bldg_footprint_sqft){
        return{pass: false, message: 'Missing building footprint', score:70}
    }

    if(fields.ll_bldg_footprint_sqft <= 0 ){
        return {pass: false, message: 'Invalid footprint size', score: 30}
    }

    return {pass: true, message: 'has building data', score:100}
}

//Lot Size
function validateLotSize(parcel){
    const fields = parcel.data?.properties?.fields
    if(!fields.ll_gissqft || !fields?.ll_gisacre){
        return {pass: false, message:'Missing lot size', score : 0}
    }

    if(fields.ll_gissqft <= 0 || fields.ll_gisacre <= 0) {
        return {pass:false, message:'Invalid lot size', score:0}
    }

    //check consistency: 1 acre = 43,560 sqft
    const calculated = fields.ll_gissqft / 43560
    const difference = Math.abs(calculated - fields.ll_gisacre)

    if(difference > 0.1){
        return {pass:false, message:'Inconsistent lot size values', score:60}
    }
    return {pass: true, message: 'Valid lot size', score:100}
}

//Data Fresh?
function validateDataFreshness(parcel){
    const fields = parcel.data?.properties?.fields
    if(!fields?.ll_updated_at){
        return {pass:false, message:'Missing update timestamp', score:50}
    }
    const updated = new Date(fields.ll_updated_at);
    const now = new Date()
    const daysSince = (now - updated ) / (1000 * 60 * 60 * 24);

    if(daysSince > 365){
        return { pass:false, message:'Data over 1 year old',score:60};
    }
    if(daysSince > 180){
        return {pass:false, message:'Data over 6 months old', score:80}
    }
    return {pass: true, message:'Data is fresh', score:100}
}

//Export checks
const ALL_CHECKS = [
    {name: 'Geometry Structure', fn:validateGeometry , category: 'geometry'},
    {name: 'Coordinate Validity', fn: validateCoordinates, category: 'geometry'},
    {name: 'Address Format', fn: validateAddress, category: 'address'},
    {name: 'State Code', fn: validateStateCode, category: 'address'},
    {name: 'ZIP Code', fn: validateZipCode, category: 'address'},
    {name: 'Owner Data', fn: validateOwner, category: 'property'},
    {name: 'Property Value', fn: validatePropertyValue, category: 'property'},
    {name: 'Year Built', fn: validateYearBuilt, category: 'property'},
    {name: 'UUID Format', fn: validateUUID, category: 'identifiers'},
    {name: 'Parcel Number', fn: validateParcelNumber, category: 'identifiers'},
    {name: 'USPS Validation', fn: validateUSPS, category: 'validation'},
    {name: 'Zoning Data', fn: validateZoning, category: 'zoning'},
    {name: 'Building Data', fn: validateBuildingData, category: 'building'},
    {name: 'Lot Size', fn: validateLotSize, category: 'property'},
    {name: 'Data Freshness', fn: validateDataFreshness, category: 'metadata'}
];

module.exports = {
    ALL_CHECKS, 
    validateAddress,
    validateBuildingData,
    validateCoordinates,
    validateDataFreshness,
    validateGeometry,
    validateLotSize,
    validateOwner,
    validateParcelNumber,
    validatePropertyValue,
    validateStateCode,
    validateUSPS,
    validateUUID,
    validateYearBuilt,
    validateZipCode,
    validateZoning
};
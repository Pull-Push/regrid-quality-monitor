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
    if(!/^{[A-Z]{2}$/.test(state)) {
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
        return {pass:false, message:'Missing property values, score:0'};
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
        return { pass:false, messag: 'Missing UUID format', score:0 }
    }

    const uuid = fields.ll_uuid
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

    if(!uuidPattern.test(uuid)){
        return {pass: false, message: 'Invalid UUID format', score:0}
    }

    return {pass:true, message: 'Valid UUID', score:100};
}


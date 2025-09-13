const connectDB = require("./config/db.js");
const mongoose = require("mongoose");
const Donar = require("./models/donarSchema.js");
const Hospital=require("./models/hospitalSchema.js");

connectDB().then(async () => {
    try {
        // const data = [
        //     {
        //         "name": "Rahul Sharma",
        //         "age": 28,
        //         "gender": "Male",
        //         "phone": "+91-9876543210",
        //         "email": "rahul.sharma@example.com",
        //         "bloodGroup": "O+",
        //         "registeredBy": "Self",
        //         "location": {
        //             "type": "Point",
        //             "coordinates": [78.486671, 17.385044],   // Hyderabad (lng, lat)
        //             "lastUpdated": "2025-09-13T10:15:00Z"
        //         },
        //         "history": [
        //             {
        //                 "hospitalId": "650f9c1c8a7c6f2e9c12ab34",
        //                 "date": "2025-05-20T09:30:00Z"
        //             },
        //             {
        //                 "hospitalId": "650f9c1c8a7c6f2e9c12ab99",
        //                 "date": "2025-08-10T14:15:00Z"
        //             }
        //         ]
        //     },
        //     {
        //         "name": "Ananya Verma",
        //         "age": 24,
        //         "gender": "Female",
        //         "phone": "+91-9123456789",
        //         "email": "ananya.verma@example.com",
        //         "bloodGroup": "A-",
        //         "registeredBy": "Hospital",
        //         "registeredHospitalId": "650f9c1c8a7c6f2e9c12ac56",
        //         "location": {
        //             "type": "Point",
        //             "coordinates": [77.594566, 12.971599],   // Bangalore
        //             "lastUpdated": "2025-09-12T08:45:00Z"
        //         },
        //         "history": [
        //             {
        //                 "hospitalId": "650f9c1c8a7c6f2e9c12ac56",
        //                 "date": "2025-07-15T11:00:00Z"
        //             }
        //         ]
        //     },
        //     {
        //         "name": "Mohammed Ali",
        //         "age": 35,
        //         "gender": "Male",
        //         "phone": "+91-9000011122",
        //         "email": "ali.mohammed@example.com",
        //         "bloodGroup": "B+",
        //         "registeredBy": "Self",
        //         "location": {
        //             "type": "Point",
        //             "coordinates": [72.877655, 19.075983],   // Mumbai
        //             "lastUpdated": "2025-09-13T12:20:00Z"
        //         },
        //         "history": []
        //     }
        // ]


        const hospdata = [
            {
                "name": "Apollo Hospital Hyderabad",
                "licenseId": "HOSP-TS-1001",
                "address": "Road No. 72, Jubilee Hills, Hyderabad, Telangana, India",
                "phone": "+91-40-23607777",
                "email": "contact@apollohyd.com",
                "location": {
                    "type": "Point",
                    "coordinates": [78.420012, 17.423901]   // (lng, lat) Hyderabad
                },
                "donors": []
            },
            {
                "name": "Fortis Hospital Bangalore",
                "licenseId": "HOSP-KA-2033",
                "address": "Bannerghatta Road, Bengaluru, Karnataka, India",
                "phone": "+91-80-66214444",
                "email": "fortisblr@example.com",
                "location": {
                    "type": "Point",
                    "coordinates": [77.597022, 12.910146]   // Bangalore
                },
                "donors": []
            },
            {
                "name": "Lilavati Hospital Mumbai",
                "licenseId": "HOSP-MH-5099",
                "address": "A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra, India",
                "phone": "+91-22-26568000",
                "email": "info@lilavatihospital.com",
                "location": {
                    "type": "Point",
                    "coordinates": [72.837124, 19.058789]   // Mumbai
                },
                "donors": []
            }
        ]

        // const result = await Donar.insertMany(data);
        const result  = await Hospital.insertMany(hospdata);
        console.log("insertion successful");
    } catch (err) {
        console.log(err);
    }


})
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
var firebaseConfig = {
    
};
// Initialize Firebase

const serviceAccount = require('./google-service-account.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
function getUid(imei) {
    var intimei = parseInt(imei);


    return new Promise(function (resolve, reject) {
        const query = db.collection('imei').where('imei', 'array-contains', intimei);

        // Get the first document in the query results
        query.get().then(async (querySnapshot) => {
            if (!querySnapshot.empty) {
                // If a document was found, get the collection name
                const uid = await querySnapshot.docs[0].ref.id;
                resolve(uid.trim());
            } else {
                reject(2);
            }
        }).catch((error) => {
            reject(error);
        });
    })
}

async function addMessage(json) {
    var now = new Date();
    if(json['type']<=1){
        var message = {
            imei: parseInt(json['imei']),
            number: parseInt(json['number']),
            message: json['message'],
            type:parseInt(json['type']),
            timestamp: now.getTime()
        };
        console.log(message)
        var uid = await getUid(json['imei']).then(function (response) {
            var url = `users/${response}/imei/${json['imei']}/messages`;
            usercoll = db.collection(url).add(message)
            usercoll.then((stat)=>{console.log(stat)})
        });
    }
    else if(json['type']>1 && json['type']<=6  ){
        var call = {
            imei: parseInt(json['imei']),
            number: parseInt(json['number']),
            type:parseInt(json['type']),
            timestamp: now.getTime()
        };
        // console.log(message)
        var uid = await getUid(json['imei']).then(function (response) {
            var url = `users/${response}/imei/${json['imei']}/calls`;
            usercoll = db.collection(url).add(call)
            usercoll.then((stat)=>{console.log(stat)})
        });
        
    }
    else{
        // var specialComm = {
        //     imei: parseInt(json['imei']),
        //     number: parseInt(json['number']),
        //     type:parseInt(json['type']),
        //     timestamp: now.getTime()
        // };
        // console.log(message)
        // var uid = await getUid(json['imei']).then(function (response) {
        //     var url = `users/${response}/imei/${json['imei']}/messages`;
        //     usercoll = db.collection(url).add(message)
        //     usercoll.then((stat)=>{console.log(stat)})
        // });
        console.log("SpecialComms Not Configured")

    }
    

};




const mqtt = require("mqtt");
const options={
    clean:true
}
const client = mqtt.connect("mqtt://broker.uniolabs.in:1883",options);
client.on("connect", function () {
    console.log("connected");

    client.subscribe("sms", function (err) { });

    client.on('message', (topic, message) => {
        // console.log(message.toString());
        // console.log('receive message: ', topic, message.toString())
        msg = JSON.parse(message.toString())
        console.log(msg)
        addMessage(msg)
    })

    client.on("error", (err) => {
        console.log(err);
        clearInterval(interval);
    });
});



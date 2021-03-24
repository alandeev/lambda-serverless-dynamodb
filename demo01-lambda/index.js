async function handler(event, contect) {
    console.log("Ambiente", JSON.stringify(process.env, null, 2));
    console.log("Evento...", JSON.stringify(event, null, 2));

    return {
        hello: 'hey guy' //edit
    }
}


module.exports = {
    handler
}
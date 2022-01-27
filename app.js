var express = require('express');
var config = require('./config');
// var connection = require('./connection');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();
app.set('port', config.port || 3000);

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);


const fs = require('fs');
// const ora = require('ora');
// const chalk = require('chalk');
const qrcode = require('qrcode-terminal');

const { Client, MessageMedia, Buttons } = require('whatsapp-web.js');


const SESSION_FILE_PATH = './session.json';
let client;
let sessionData;

const withSession = () => {
    //si existe cargamos el archivo con las credenciales
    console.log('Validando sesion con Whatsapp...')
    sessionData = require(SESSION_FILE_PATH);
    

    client = new Client({
        session:sessionData
    })

    client.on('ready', () => {
        console.log('Client is ready!');
        listenMessage();
        // sendMessage('5216141423817@c.us', 'hola mi amore')
    });

    client.on('auth_failure', () => {
        console.log('Error en la sesion');

    });

    client.initialize();
}


/**
 * Esta funcion crea el codigo QR de la sesion
 */
const withOutSession = () => {
    
    console.log('No tenemos sesion guardada');
    client = new Client();
    client.on('qr', qr =>{
        qrcode.generate(qr, {small:true});
        // console.log(qr);
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        listenMessage();
    });


    client.on('authenticated', (session) => {
        //Guardamos credenciales de la sesion para usar luego
        sessionData = session;
        fs.writeFile(SESSION_FILE_PATH,JSON.stringify(session), (err) => {
            if (err) {
                console.log(err);
            }
        })
    })

    client.initialize();
}

const listenMessage = () => {
    client.on('message', (msg) => {
        const contact = msg.getContact();

        // var inputs = [{id:'customId',body:'button1'},{body:'button2'},{body:'button3'},{body:'button4'}]
        // var buttons = new Buttons("hola desde el boton", inputs)
        // buttons._format(inputs);

        console.log('%c⧭', 'color: #00a3cc', contact);
        const { from, to, body} = msg;

        console.log( from, to, body );

        switch (body) {
            case 'hola buscaba un perfume':
                sendMessage(from, 'Hola, claro que si con gusto le puedo atender le dejo el catalogo mas reciente para que lo vea y sepa si manejamos la fragancia que buscaba.')
                sendMedia(from, 'CatalogoMM.pdf')
                break;
            case 'Botones':
                sendMessage(from, 'hola pediste botones')
                sendButtons(from)
                break;
            case 'Catalogo de perfumes':
                sendMessage(from, 'Aqui te dejamos el catalogo de perfumes')
                sendMedia(from, 'CatalogoMM.pdf')
                break;
            default:
                break;
        }
        
    })
}

const sendMedia = (to, file) => {
    const mediaFile = MessageMedia.fromFilePath(`./public/mediaSend/${file}`)
    client.sendMessage(to, mediaFile);
}

const sendButtons = (to) => {
    const buttons = new Buttons("este es el body de boton", [{id:'customId',body:'button1'},{body:'Catalogo de perfumes'},{body:'button3'},{body:'button4'}]);
    client.sendMessage(to, buttons);
}

const sendMessage = (to, message) => {
    // var inputs = [{id:'customId',body:'button1'},{body:'button2'},{body:'button3'},{body:'button4'}]
    // var buttons = new Buttons("hola desde el boton", inputs)
    // buttons._format(inputs);
    
    client.sendMessage(to,message);
    
}

/** */
(fs.existsSync(SESSION_FILE_PATH)) ? withSession() : withOutSession();


// client.on('qr', qr => {
//     qrcode.generate(qr, {small: true});
// });

// client.on('ready', () => {
//     console.log('Client is ready!');
// });

// client.initialize();

module.exports = app;
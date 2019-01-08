const fs = require('fs');
const spell = require('spell-checker-js');
const _ = require('lodash');
// const {app, BrowserWindow} = require('electron');
// var remote = require('remote'); // Load remote compnent that contains the dialog dependency
// var dialog = remote.require('dialog');


spell.load('en');

let mainWindow;

// Quit when all windows are closed.
// app.on('window-all-closed', function() {
//   if (process.platform != 'darwin')
//     app.quit();
// // });

// // This method will be called when Electron has done everything
// // initialization and ready for creating browser windows.
// app.on('ready', function() {
//   // Create the browser window.
//   mainWindow = new BrowserWindow({width: 800, height: 600});

//   // and load the index.html of the app.
//   mainWindow.loadURL('file://' + __dirname + '/index.html');

//   // Emitted when the window is closed.
//   mainWindow.on('closed', function() {
//     // Dereference the window object, usually you would store windows
//     // in an array if your app supports multi windows, this is the time
//     // when you should delete the corresponding element.
//     mainWindow = null;
//   });
// });


fs.readFile('en.json', (err, data) => {
    if (err) {
        return err;
    }

    let reservedWords = ['Shop ERP Code', 'Aadhaar Number', 'Pincode'];

    let spellCheckJson = JSON.parse(data);
    let wholeKeys = Object.keys(spellCheckJson);
    let directHtmlValues = [];
    let indirectValues = [];
    for (let value of wholeKeys) {
        if (typeof (spellCheckJson[value]) === 'string') {
            directHtmlValues.push(value);
        } else {
            indirectValues.push(value);
        }
    }

    // console.log(directHtmlValues);
    // console.log(indirectValues);
    console.log(spellCheck(reservedWords, wholeKeys));
    console.log(spaceCheck(wholeKeys))
    // console.log(checkTitleCase(wholeKeys));
});

function spaceCheck(values){
    let  punchuateerror =[];
    for(let word of values){
        let splittedWords = word.split(' ');
        for(let i=0;i<=splittedWords.length;i++){
            if(splittedWords[i]=== ''){
                punchuateerror.push(word);
            }
        }
    }
    return _.uniq(punchuateerror);
}

function checkTitleCase(values) {
    let titleCaseError = [];
    for (let value of values) {
        let words = String(value).split(' ');
        let flag = 0;
        for (let word of words) {
            if (!checkWordisCapital(word[0])) {
                flag = 1;
            } else {
                flag = checkWordContaincapital(word);
            }
        }
        if (flag === 1) {
            titleCaseError.push(value);
        }
    }
    return titleCaseError;
}

function checkWordisCapital(letter) {
    return /[A-Z]/.test(letter);
}

function checkWordContaincapital(word) {
    for (let i = 1; i < word.length; i++) {
        if (checkWordisCapital(word[i])) {
            return 1;
        }
    }
    return 0;
}

function checkCamelCase(values) {
    const camelCasePattern = '[a-z]+((\d)|([A-Z0-9][a-z0-9]+))*([A-Z])?';
    let pattern = new RegExp(camelCasePattern);
    let camelCaseError = [];
    for (let value in values) {
        if (pattern.test(values[value])) {
            camelCaseError.push(values[value]);
        }
    }

    return camelCaseError;
}

function spellCheck(reservedWords, values) {
    let spellErrorArray = [];
    for (let val of values) {
        let check = spell.check(val);
        if (check.length) {
            if (!reservedWords.includes(val)) {
                spellErrorArray.push(check[0]);
            }
        }
    };
    return spellErrorArray;
}
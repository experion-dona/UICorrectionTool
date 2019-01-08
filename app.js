const fs = require('fs');
const spell = require('spell-checker-js');
const _ = require('lodash');
// const po2json = require('po2json');
var PO = require('pofile');

spell.load('en');

function clicked() {
    $("ul").empty();
    $('#spell').empty();
    $('#title').empty();
    let filePath = document.getElementsByTagName('input')[0].files[0].path;
    fs.readFile(filePath, (err, data) => {
        if (err) {
            return err;
        }

        var fileExt = document.getElementsByTagName('input')[0].files[0].name.split('.').pop();

        if(fileExt !== 'json'){
            callPotFile(document.getElementsByTagName('input')[0].files[0].path);
            return;
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

        let spellError = spellCheck(reservedWords, directHtmlValues);
        let titleCaseError = checkTitleCase(reservedWords, directHtmlValues);
        let doubleSpace = spaceCheck(directHtmlValues);

        var list = $('#list')
        _.each(directHtmlValues, function (arr) {
            var item = $('<li/>');
            item.addClass('list-group-item');
            if($('#chkgspell').is(':checked') && spellError.indexOf(arr) > -1){
                item.addClass('spell-error');
            }
            if($('#chkgtitle').is(':checked') && titleCaseError.indexOf(arr) > -1){
                item.addClass('title-error');
            }
            if($('#chkgcommon').is(':checked') && doubleSpace.indexOf(arr) > -1){
                item.addClass('common-error');
            }
            item.append(arr);
            list.append(item);
        });
        let group2TitleError = checkTitleCase(reservedWords, indirectValues);

        var group2 = $('#group2')
        _.each(indirectValues, function (arr) {
            var item = $('<li/>');
            item.addClass('list-group-item');
            if(spellError.indexOf(arr) > -1){
                item.addClass('spell-error');
            }
            if($('#chktitle').is(':checked') && group2TitleError.indexOf(arr) > -1){
                item.addClass('title-error');
            }
            item.append(arr);
            group2.append(item);
        });

        // if ($('#chkgspell').is(':checked')) {
        //     $('#spell').text(spellCheck(reservedWords, directHtmlValues));
        // }

        // if($('#chkgtitle').is(':checked')){
        //     $('#title').text(checkTitleCase(reservedWords, directHtmlValues));
        // }

        if ($('#chkspell').is(':checked')) {
            $('#spellg').text(spellCheck(reservedWords, indirectValues));
        }

        if($('#chktitle').is(':checked')){
            $('#titleg').text(checkTitleCase(reservedWords, indirectValues));
        }



        // console.log(directHtmlValues);
        // console.log(indirectValues);
        console.log(spellCheck(reservedWords, wholeKeys));
        console.log(spaceCheck(wholeKeys))
        // console.log(checkTitleCase(wholeKeys));
    });

}

function callPotFile(filePath){
    PO.load(filePath, function (err, po) {
        if(err){
            return err;
        }
        splitIntoGroup(po);
    });
}


function splitIntoGroup(po){
    let group1 =[];
    let group2=[];
    for(let item of po.items){
        innerLoop:
        for(let i =0;i<item.references.length;i++){
            if(item.references[i].split('.').pop() === 'js'){
                group2.push(item.msgid);
                break innerLoop;
            }else if((i+1) === item.references.length){
                group1.push(item.msgid);
            }
        }
    }

    let spellCheckError = spellCheck("",group1);

    var list = $('#list')
        _.each(group1, function (arr) {
            var item = $('<li/>');
            item.addClass('list-group-item');
            if($('#chkgspell').is(':checked') && spellCheckError.indexOf(arr) > -1){
                item.addClass('spell-error');
            }
            if($('#chkgtitle').is(':checked') && titleCaseError.indexOf(arr) > -1){
                item.addClass('title-error');
            }
            if($('#chkgcommon').is(':checked') && doubleSpace.indexOf(arr) > -1){
                item.addClass('common-error');
            }
            item.append(arr);
            list.append(item);
        });

        let spellCheckError2 = spellCheck("",group2);
        let titleCaseError2 = checkTitleCase([], group2);
        let doubleSpace2 = spaceCheck(group2);

        var group2list = $('#group2')
        _.each(group2, function (arr) {
            var item = $('<li/>');
            item.addClass('list-group-item');
            if($('#chkspell').is(':checked') && spellCheckError2.indexOf(arr) > -1){
                item.addClass('spell-error');
            }
            if($('#chktitle').is(':checked') && titleCaseError2.indexOf(arr) > -1){
                item.addClass('title-error');
            }
            if($('#chkcommon').is(':checked') && doubleSpace2.indexOf(arr) > -1){
                item.addClass('common-error');
            }
            item.append(arr);
            group2list.append(item);
        });

    console.log(group2);
}

function spaceCheck(values) {
    let punchuateerror = [];
    for (let word of values) {
        let splittedWords = word.split(' ');
        for (let i = 0; i <= splittedWords.length; i++) {
            if (splittedWords[i] === '') {
                punchuateerror.push(word);
            }
        }
    }
    return _.uniq(punchuateerror);
}

function checkTitleCase(reserved,values) {
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
    loop1:
    for (let val of values) {
        let check = spell.check(val);
        if (check.length) {
            if (!reservedWords.includes(val)) {
                spellErrorArray.push(val);
                continue loop1;
            }
        }
    };
    return spellErrorArray;
}